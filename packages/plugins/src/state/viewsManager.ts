import { createSelector } from 'reselect';
import { Store } from './types'

function selectorFactory(proxy, modelName: string, dependencies: string[], fn) {
  return createSelector(
    (state: any, otherArgs?: any)=> {
      return state[modelName]
    },
    (state: any, otherArgs?: any)=> {
      const result: Record<string, any>= {};
      dependencies.forEach(function(dep){
        result[dep] = state[dep];
      })
      return result;
    },
    (state: any, otherArgs?: any)=> otherArgs,
    (modelState, dependenciesState, otherArgs) => fn.call(proxy, modelState, dependenciesState, proxy, otherArgs),
  );
}

const handler =  {
  get: function(target: Record<string, (...args: any[]) => any>, prop: string) {
    const result = target[prop];
    if(typeof result === 'function'){
      return result();
    }
    return  result;
  }
}

const createViewsManager = () => {
  const viewsModelsMap = new Map<string, Record<string, (...args: any[]) => any>>();
  const addView = function (
    name: string,
    views?: Record<string, (...args: any[]) => any>
  ) {
    if(views){
      viewsModelsMap.set(name, views)
    }
  };
  const getView = function (name: string) {
    return viewsModelsMap.get(name);
  };
  return {
    addView,
    getView
  };
};

function getViewsProxy<T = any>(
  modelName: string,
  viewsManager: ReturnType<typeof createViewsManager>,
  store: Store,
  args: any,
) {
  const view = viewsManager.getView(modelName);
  if (!view) {
    return store.getState()[modelName];
  }
  const proxyObj: Record<string, any>= {};
  const proxy = new Proxy(proxyObj, handler);
  const rootState = store.getState();
  Object.keys(view || {}).forEach((selectorName: string) => {
    const selectorFn = selectorFactory(proxy, modelName, ['dome'], view[selectorName])
    proxyObj[selectorName] = function(){
      return selectorFn(rootState, args)
    }
  });
  return proxy;
}

export { createViewsManager, getViewsProxy };
