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
import { createViewsManager, getStateOrViews } from './viewsManager';
import subscriptionsPlugin from './plugins/subscriptions';
import { shadowEqual } from './utils';
import { Store } from './types'

type initConfig = Parameters<typeof init>[0];

type Config = initConfig & {
  plugins?: ((...args: any[]) => Plugin<any, any>) | Plugin<any, any>;
};

interface INamedModel<
  TModels extends Models<TModels>,
  TState = any,
  TBaseState = TState
> extends NamedModel<TModels, TState, TBaseState> {
  views?: Record<string, (state: TState, RootState: any, views: any, args: any) => any>;
}

type selector<TState = any> = (state: TState, views: any) => any

export interface IUseModel {
  <TModels extends Models<TModels>, TState = any, TBaseState = TState>(
    model: INamedModel<TModels, TState, TBaseState>,
    selector?: selector<TState>
  ): [any, any];
}

function initModel(
  model: INamedModel<any>,
  store: Store,
  batchManager: ReturnType<typeof createBatchManager>,
  viewsManager: ReturnType<typeof createViewsManager>
) {
  const name = model.name || '';
  if (!batchManager.hasInitModel(name)) {
    (
      model as INamedModel<any> & { _subscriptions: Record<string, () => void> }
    )._subscriptions = {
      [`${name}/*`]: () => {
        batchManager.triggerSubsribe(name);  // render
      }
    };
    viewsManager.addView(name, model.views);
    store.addModel(model);
    batchManager.addSubsribe(name);
  }
}

function getStateDispatch(
  name: string,
  store: Store,
  viewsManager: ReturnType<typeof createViewsManager>,
  selector?: selector,
) {
  const dispatch = store.dispatch;
  return [
    getStateOrViews(name, viewsManager, store, selector),
    dispatch[name]
  ] as [any, any];
}

const createContainer = (config: Config) => {
  let configFromProvider: Config | null = null;

  const Context = createContext<{
    store: Store;
    batchManager: ReturnType<typeof createBatchManager>;
    viewsManager: ReturnType<typeof createViewsManager>;
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
    const viewsManager = createViewsManager(store);

    return (
      <Context.Provider value={{ store, batchManager, viewsManager }}>
        {children}
      </Context.Provider>
    );
  };

  const createUseModel =
    (
      store: Store,
      batchManager: ReturnType<typeof createBatchManager>,
      viewsManager: ReturnType<typeof createViewsManager>
    ): IUseModel =>
      (model, selector) => {
      invariant(
        Boolean(model.name),
        `createUseModel param model.name is necessary for Model.`
      );
      const name = model.name || '';
      const initialValue = useMemo((): [
        any,
        Record<string, (...args: any[]) => void>
      ] => {
        initModel(model, store, batchManager, viewsManager);
        return getStateDispatch(name, store, viewsManager, selector);
      }, [model, name, selector]);

      const [modelValue, setModelValue] = useState(initialValue);

      const lastValueRef = useRef<any>(initialValue);

      useEffect(() => {
        const fn = () => {
          const newValue = getStateDispatch(name, store, viewsManager, selector);
          if (
            !shadowEqual(lastValueRef.current[0], newValue[0])
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

  const useModel: IUseModel = (model, selector) => {
    invariant(Boolean(model), `useModel param model is necessary`);

    const context = useContext(Context);

    invariant(
      Boolean(context),
      `You should wrap your Component in CreateApp().Provider.`
    );

    const { store, batchManager, viewsManager } = context;

    return useMemo(
      () => createUseModel(store, batchManager, viewsManager),
      [store]
    )(model, selector);
  };

  const useStaticModel: IUseModel = (model, selector) => {

    const context = useContext(Context);

    invariant(
      Boolean(context),
      'You should wrap your Component in CreateApp().Provider.'
    );

    invariant(
      Boolean(model && model.name),
      `useStaticModel param model and model.name is necessary`
    );

    const { store, batchManager, viewsManager } = context;
    const name = model.name || '';
    const initialValue = useMemo(() => {
      initModel(model, store, batchManager, viewsManager);
      return getStateDispatch(name, store, viewsManager, selector);
    }, [model, name]);

    const value = useRef<[any, any]>([
      // deep clone state in case mutate origin state accidentlly.
      JSON.parse(JSON.stringify(initialValue[0])),
      initialValue[1]
    ]);

    useEffect(() => {
      const fn = () => {
        const newValue = getStateDispatch(name, store, viewsManager, selector);
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

  const useLocalModel: IUseModel = (model, selector) => {
    const [store, batchManager, selectorManager] = useMemo(() => {
      const newStore = init(getFinalConfig());
      return [newStore, createBatchManager(), createViewsManager(newStore)];
    }, []);

    return useMemo(
      () => createUseModel(store, batchManager, selectorManager),
      []
    )(model, selector);
  };

  return {
    Provider,
    useModel,
    useStaticModel,
    useLocalModel
  };
};

export default createContainer;
