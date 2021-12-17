import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useState,
  useMemo,
  useRef
} from 'react';
import { init, Models, Plugin, NamedModel } from '@rematch/core';
import invariant from '@shuvi/utils/lib/invariant';
import { createBatchManager } from './batchManager';
import { createSelectorManager, mapStateBySelect } from './selectorManager';
import subscriptionsPlugin from './plugins/subscriptions';
import { shadowEqual } from './utils';

type initConfig = Parameters<typeof init>[0];
type Store = ReturnType<typeof init>;
type Config = initConfig & {
  plugins?: ((...args: any[]) => Plugin<any, any>) | Plugin<any, any>;
};

interface INamedModel<
  TModels extends Models<TModels>,
  TState = any,
  TBaseState = TState
> extends NamedModel<TModels, TState, TBaseState> {
  selector?: Record<string, (state: TState) => void>;
}

export interface IUseModel {
  <TModels extends Models<TModels>, TState = any, TBaseState = TState>(
    model: INamedModel<TModels, TState, TBaseState>
  ): [any, any];
}

function initModel(
  name: string,
  model: INamedModel<any>,
  store: Store,
  batchManager: ReturnType<typeof createBatchManager>,
  selectorManager: ReturnType<typeof createSelectorManager>
) {
  if (!batchManager.hasInitModel(name)) {
    (
      model as INamedModel<any> & { _subscriptions: Record<string, () => void> }
    )._subscriptions = {
      [`${name}/*`]: () => {
        batchManager.triggerSubsribe(name);
      }
    };
    selectorManager.addSelector(name, model.selector);
    store.addModel(model);
  }
}

function getStateDispatch(
  name: string,
  store: Store,
  selectorManager: ReturnType<typeof createSelectorManager>
) {
  const state = store.getState();
  const dispatch = store.dispatch;
  return [
    mapStateBySelect(state[name], selectorManager.getSelector(name)),
    dispatch[name]
  ] as [any, any];
}

const createContainer = (config: Config) => {
  let configFromProvider: Config | null = null;

  const Context = createContext<{
    store: Store;
    batchManager: ReturnType<typeof createBatchManager>;
    selectorManager: ReturnType<typeof createSelectorManager>;
  }>(null as any);

  function getFinalConfig() {
    const finalConfig = { ...(config || {}), ...configFromProvider };
    finalConfig.plugins = [
      subscriptionsPlugin,
      ...(finalConfig.plugins || [])
    ].map(plugin => {
      if (typeof plugin === 'function') {
        return plugin();
      }
      return plugin;
    });
    return finalConfig;
  }

  const Provider = (
    props: PropsWithChildren<{ store?: Store; config?: Config }>
  ) => {
    const { children, store: storeFromProps, config: _config = {} } = props;
    configFromProvider = _config;

    let store: Store;
    if (storeFromProps) {
      store = storeFromProps;
    } else {
      store = init(getFinalConfig());
    }
    const batchManager = createBatchManager();
    const selectorManager = createSelectorManager();

    return (
      <Context.Provider value={{ store, batchManager, selectorManager }}>
        {children}
      </Context.Provider>
    );
  };

  const createUseModel =
    (
      store: Store,
      batchManager: ReturnType<typeof createBatchManager>,
      selectorManager: ReturnType<typeof createSelectorManager>
    ): IUseModel =>
    model => {
      invariant(
        Boolean(model.name),
        `createUseModel param model.name is necessary for Model.`
      );
      const name = model.name || '';
      const initialValue = useMemo((): [
        any,
        Record<string, (...args: any[]) => void>
      ] => {
        initModel(name, model, store, batchManager, selectorManager);
        return getStateDispatch(name, store, selectorManager);
      }, [model, name]);

      const [modelValue, setModelValue] = useState(initialValue);

      const lastValueRef = useRef<any>(initialValue);

      useEffect(() => {
        const fn = () => {
          const newValue = getStateDispatch(name, store, selectorManager);
          if (
            !shadowEqual(lastValueRef.current[0], newValue[0]) ||
            !shadowEqual(lastValueRef.current[1], newValue[1])
          ) {
            setModelValue(newValue as any);
            lastValueRef.current = newValue;
          }
        };
        const unsubsribe = batchManager.addSubsribe(name, fn);

        return () => {
          unsubsribe();
        };
      }, []);

      return modelValue;
    };

  const useModel: IUseModel = model => {
    invariant(Boolean(model), `useModel param model is necessary`);

    const context = useContext(Context);

    invariant(
      Boolean(context),
      `You should wrap your Component in CreateApp().Provider.`
    );

    const { store, batchManager, selectorManager } = context;

    return useMemo(
      () => createUseModel(store, batchManager, selectorManager),
      [store]
    )(model);
  };

  const useStaticModel: IUseModel = model => {
    const context = useContext(Context);

    invariant(
      Boolean(context),
      'You should wrap your Component in CreateApp().Provider.'
    );

    invariant(
      Boolean(model && model.name),
      `useStaticModel param model and model.name is necessary`
    );

    const { store, batchManager, selectorManager } = context;
    const name = model.name || '';
    const initialValue = useMemo(() => {
      initModel(name, model, store, batchManager, selectorManager);
      return getStateDispatch(name, store, selectorManager);
    }, [model, name]);

    const value = useRef<[any, any]>([
      // deep clone state in case mutate origin state accidentlly.
      JSON.parse(JSON.stringify(initialValue[0])),
      initialValue[1]
    ]);

    useEffect(() => {
      const fn = () => {
        const newValue = getStateDispatch(name, store, selectorManager);
        if (
          Object.prototype.toString.call(value.current[0]) === '[object Object]'
        ) {
          // merge data to old reference
          Object.assign(value.current[0], newValue[0]);
          Object.assign(value.current[1], newValue[1]);
        }
      };
      const unsubsribe = batchManager.addSubsribe(name, fn);

      return () => {
        unsubsribe();
      };
    }, []);

    return value.current;
  };

  const useLocalModel: IUseModel = model => {
    const [store, batchManager, selectorManager] = useMemo(() => {
      const newStore = init(getFinalConfig());
      return [newStore, createBatchManager(), createSelectorManager()];
    }, []);

    return useMemo(
      () => createUseModel(store, batchManager, selectorManager),
      []
    )(model);
  };

  return {
    Provider,
    useModel,
    useStaticModel,
    useLocalModel
  };
};

export default createContainer;
