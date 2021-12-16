import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useState,
  useMemo,
  useRef
} from 'react';
import { init, Model, Models, Plugin } from '@rematch/core';
import invariant from '@shuvi/utils/lib/invariant';
import { createBatchManager } from './batchManager';
import subscriptionsPlugin from './rematch-subscriptions';

type initConfig = Parameters<typeof init>[0];
type Store = ReturnType<typeof init>;
type Config = initConfig & {
  plugins?: ((...args: any[]) => Plugin<any, any>) | Plugin<any, any>;
};

interface IUseModel {
  <TModels extends Models<TModels>, TState = any>(
    model: Model<TModels, TState> & {
      name: string;
      _subscriptions?: Record<string, () => void>;
    }
  ): [any, Record<string, (...args: any[]) => void>];
}

const shadowEqual = (a: any, b: any) => {
  if (
    Object.prototype.toString.call(a) !== '[object Object]' ||
    Object.prototype.toString.call(b) !== '[object Object]'
  ) {
    return a === b;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  return Object.keys(a).every(key => a[key] === b[key]);
};

const createGlobalStore = (config: Config) => {
  let configFromProvider: Config | null = null;

  const Context = createContext<{
    store: Store;
    batchManager: ReturnType<typeof createBatchManager>;
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

    return (
      <Context.Provider value={{ store, batchManager }}>
        {children}
      </Context.Provider>
    );
  };

  const createUseModel =
    (
      store: Store,
      batchManager: ReturnType<typeof createBatchManager>
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
        if (name && !batchManager.hasInitModel(name)) {
          model._subscriptions = {
            [`${name}/*`]: () => {
              batchManager.triggerSubsribe(name);
            }
          };
          // @ts-ignore
          store.addModel(model);
        }
        const state = store.getState();
        const dispatch = store.dispatch;
        if (name) {
          return [state[name], dispatch[name]];
        }
        return [state, dispatch];
      }, [model, name]);
      const [modelValue, setModelValue] = useState(initialValue);

      const lastValueRef = useRef<any>(initialValue);

      useEffect(() => {
        const fn = () => {
          const newState = store.getState();
          const newDispatch = store.dispatch;
          let newValue;
          if (name) {
            newValue = [newState[name], newDispatch[name]];
          } else {
            newValue = [newState, newDispatch];
          }
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

    const { store, batchManager } = context;

    return useMemo(() => createUseModel(store, batchManager), [store])(model);
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

    const { store, batchManager } = context;
    const name = model.name || '';
    const initialValue = useMemo(() => {
      if (name && !batchManager.hasInitModel(name)) {
        model._subscriptions = {
          [`${name}/*`]: () => {
            batchManager.triggerSubsribe(name);
          }
        };
        // @ts-ignore
        store.addModel(model);
      }
      const state = store.getState();
      const dispatch = store.dispatch;
      if (name) {
        return [state[name], dispatch[name]];
      }
      return [state, dispatch];
    }, [model, name]);

    const [modelValue] = useState(initialValue);

    const value = useRef<[any, any]>([
      // deep clone state in case mutate origin state accidentlly.
      JSON.parse(JSON.stringify(modelValue[0])),
      modelValue[1]
    ]);

    useEffect(() => {
      const fn = () => {
        const newState = store.getState();
        const newDispatch = store.dispatch;
        let newValue;
        if (name) {
          newValue = [newState[name], newDispatch[name]];
        } else {
          newValue = [newState, newDispatch];
        }
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
    const [store, batchManager] = useMemo(() => {
      const newStore = init(getFinalConfig());
      return [newStore, createBatchManager()];
    }, []);

    return useMemo(() => createUseModel(store, batchManager), [])(model);
  };

  return {
    Provider,
    useModel,
    useStaticModel,
    useLocalModel
  };
};

export default createGlobalStore;
