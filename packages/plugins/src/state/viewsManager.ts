import { createSelector } from 'reselect';
import { shadowEqual } from './utils'
import { Store } from './types'

interface ICompare {
  new: Set<string>,
  isSimpleValue: boolean;
}

interface IViewsCompare {
  new: Map<string, any>,
}

const getProxyHandler = (compare: IViewsCompare, otherArgs: any) =>{
  const handler =  {
    get: function(target: Record<string, (...args: any[]) => any>, prop: string) {
      let result = target[prop];
      if(typeof result === 'function'){
        result = result(otherArgs);
      }
      if(!compare.new.has(prop)){
        compare.new.set(prop, result);
      }
      return  result;
    }
  }
  return handler;
}

const getCollectionHandler = (compare: ICompare) => {
  const handler = {
    get(target: any, p: string, receiver: any): any {
      const result = target[p]
      compare.new.add(p);
      return result;
    }
  }
  return handler;
}

function compareArguments(prev: any, next: any, compare: ICompare) {
  if(compare.isSimpleValue){
    return shadowEqual(prev, next)
  }
  const keys = [...compare.new];
  for(let i = 0; i<keys.length; i++){
    const key = keys[i];
    if(!shadowEqual(prev[key], next[key])){
      return false;
    }
  }
  return true;
}

function cacheFactory(modelName: string, dependencies: string[], fn, getView) {
  const stateCompare = {
    new: new Set<string>(),
    isSimpleValue: false,  // may be not a object
  };

  const rootStateCompare = {
    new: new Set<string>(),
    isSimpleValue: false,
  };

  const otherArgsCompare = {
    new: new Set<string>(),
    isSimpleValue: false, // may be not a object
  }

  const viewsCompare = {
    new: new Map<string, any>(),
    viewsProxy: Proxy.revocable({}, {}),
  };

  let argumentsPosition = 0;

  return createSelector(
    (state: any)=> state[modelName],
    (state: any)=> {
      const result: Record<string, any>= {};
      // generate rootState by dependencies
      dependencies.forEach(function(dep){
        result[dep] = state[dep];
      })
      // result must be a object
      return result;
    },
    (state: any, otherArgs?: any)=> otherArgs,
    (state, rootState, otherArgs) => {
      // reset compare
      argumentsPosition = 0;
      stateCompare.new.clear();
      rootStateCompare.new.clear();
      otherArgsCompare.new.clear();
      viewsCompare.new.clear();
      if(typeof viewsCompare.viewsProxy.revoke === 'function'){
        viewsCompare.viewsProxy.revoke();
      }

      let tempState = state;
      let stateProxy;
      if(typeof state === 'object'){
        // Collection deps
        stateCompare.isSimpleValue = false;
        stateProxy = Proxy.revocable(state, getCollectionHandler(stateCompare));
        tempState = stateProxy.proxy
      }else{
        stateCompare.isSimpleValue = true;
      }

      const rootStateProxy = Proxy.revocable(rootState, getCollectionHandler(rootStateCompare));
      const tempRootStateProxy = rootStateProxy.proxy;

      let tempOtherArgs = otherArgs;
      let otherArgsProxy;
      if(typeof otherArgs === 'object'){
        // Collection deps
        otherArgsCompare.isSimpleValue = false;
        otherArgsProxy = Proxy.revocable(otherArgs, getCollectionHandler(otherArgsCompare));
        tempOtherArgs = otherArgsProxy.proxy
      }else{
        otherArgsCompare.isSimpleValue = true;
      }

      const viewsProxy = Proxy.revocable(getView(modelName), getProxyHandler(viewsCompare, otherArgs));
      viewsCompare.viewsProxy = viewsProxy;
      const tempViewsProxy = viewsProxy.proxy;
      const res = fn.call(tempViewsProxy, tempState, tempRootStateProxy, tempViewsProxy, tempOtherArgs);
      stateProxy?.revoke && stateProxy.revoke();
      rootStateProxy.revoke();
      otherArgsProxy?.revoke && otherArgsProxy.revoke();
      return res;
    },
    {
      // New in 4.1: Pass options through to the built-in `defaultMemoize` function
      memoizeOptions: {
        equalityCheck: (prev, next) => {
          // console.log('modelName=>', modelName, stateCompare, rootStateCompare, otherArgsCompare, viewsCompare);
          let res = true;
          if(argumentsPosition === 0){ // stateCompare
            res = compareArguments(prev, next, stateCompare);
          }
          else if(argumentsPosition === 1){ // rootStateCompare
            res = compareArguments(prev, next, rootStateCompare);
          }
          else if(argumentsPosition === 2){ // otherArgsCompare viewsCompare
            res = compareArguments(prev, next, otherArgsCompare);
            if(res){
              // viewsCompare
              const proxyKeysMap = viewsCompare.new;
              const viewsProxy = viewsCompare.viewsProxy.proxy || {};
              for (const [key, value] of proxyKeysMap.entries()) {
                if(!shadowEqual(value, viewsProxy[key])){
                  res = false;
                  break;
                }
              }
            }
          }
          // res return false fun value will be recomputed
          if(argumentsPosition<=1){
            argumentsPosition++
          }else{
            argumentsPosition = 0; // reset for nest compare
          }
          return res;
        },
        maxSize: 1,
        resultEqualityCheck: false
      }
    }
  );
}



const createViewsManager = (store) => {
  const viewsModelsMap = new Map<string, Record<string, (...args: any[]) => any>>();
  const getView = function (name: string) {
    return viewsModelsMap.get(name);
  };
  const addView = function (
    name: string,
    views?: Record<string, (...args: any[]) => any>
  ) {
    if(views){
      const proxyObj: Record<string, any>= {};
      Object.keys(views || {}).forEach((selectorName: string) => {
        const cacheFun = cacheFactory(name, ['dome', 'other'], views[selectorName], getView)
        proxyObj[selectorName] = function(args){
          const state = store.getState();
          return cacheFun(state, args)
        }
      });
      viewsModelsMap.set(name, proxyObj)
    }
  };
  return {
    addView,
    getView
  };
};

function getStateOrViews<T = any>(
  modelName: string,
  viewsManager: ReturnType<typeof createViewsManager>,
  store: Store,
) {
  const views = viewsManager.getView(modelName);
  if (!views) {
    return store.getState()[modelName];
  }

  const keys = Object.keys(views);
  const result = {};
  keys.forEach(key=>{
    result[key] = function(args: any){
      const fn = views[key];
      if(typeof fn === 'function') return fn(args)
      return fn;
    }
  })
  return result;
}

export { createViewsManager, getStateOrViews };
