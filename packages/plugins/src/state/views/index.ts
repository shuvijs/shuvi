import { createSelector } from './createSelector';
import { isComplexObject } from '../utils';
import { Store } from '../types';
import { InternalModel } from '../model';

interface ICompare {
  keys: string[][];
  values: Map<
    any,
    {
      children: {
        [key: string]: any;
      };
    }
  >;
}

interface IViewsCompare {
  new: Map<string, any>;
}

// process backtracking generate keys chain, compare.keys = result; clear momery used
// app get root object first os tree root is the valuesMap first
function generateCompareKeys(compare: ICompare) {
  const valuesMap = compare.values;
  const root = [...valuesMap.keys()][0];
  const result: string[][] = [];
  if (root) {
    // Backtracking generate keys chain
    function visitTree(target: any, keysChain: string[]) {
      if (!target || !valuesMap.has(target)) {
        result.push([...keysChain]);
        return;
      }
      const node = valuesMap.get(target);
      if (!node) {
        return;
      }
      const children = node.children;
      const keys = Object.keys(children);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const child = children[key];
        keysChain.push(key);
        visitTree(child, keysChain);
        keysChain.pop();
      }
    }
    visitTree(root, []);
  }
  compare.keys = result;
  valuesMap.clear();
}

let isCollectionKeys = false;

let viewsStatePos: IViewsCompare;
const getProxyHandler = () => {
  const handler = {
    get: function (
      target: Record<string, (...args: any[]) => any>,
      prop: string
    ) {
      let result = target[prop];
      if (typeof result === 'function') {
        result = result();
      }
      if (isCollectionKeys) {
        if (!viewsStatePos.new.has(prop)) {
          viewsStatePos.new.set(prop, result);
        }
      }
      return result;
    }
  };
  return handler;
};
let compareStatePos: ICompare;
const getStateCollection = () => {
  return {
    get(target: any, p: string): any {
      let result = target[p];
      const isComplexObjectResult = isComplexObject(result);
      if (isCollectionKeys) {
        const compareValues = compareStatePos.values;
        if (compareValues.has(target)) {
          const treeNode = compareValues.get(target);
          treeNode &&
            (treeNode!.children[p] = isComplexObjectResult ? result : null);
        } else {
          compareValues.set(target, {
            children: {
              [p]: isComplexObjectResult ? result : null
            }
          });
        }
      }
      if (isComplexObjectResult) {
        result = createProxyObj(result, getStateCollection);
      }
      return result;
    }
  };
};

let compareRootStatePos: ICompare;
const getRootStateCollection = () => {
  return {
    get(target: any, p: string): any {
      let result = target[p];
      const isComplexObjectResult = isComplexObject(result);
      if (isCollectionKeys) {
        const compareValues = compareRootStatePos.values;
        if (compareValues.has(target)) {
          const treeNode = compareValues.get(target);
          treeNode &&
            (treeNode!.children[p] = isComplexObjectResult ? result : null);
        } else {
          compareValues.set(target, {
            children: {
              [p]: isComplexObjectResult ? result : null
            }
          });
        }
      }
      if (isComplexObjectResult) {
        result = createProxyObj(result, getRootStateCollection);
      }
      return result;
    }
  };
};

const proxyObjMap = new WeakMap<Record<string, any>, typeof Proxy>();
function createProxyObj(
  target: Record<string, any>,
  collection: typeof getStateCollection
) {
  if (proxyObjMap.has(target)) {
    return proxyObjMap.get(target);
  }
  const proxy = new Proxy(target, collection());
  proxyObjMap.set(target, proxy);
  return proxy;
}

const proxyViewsMap = new Map<string, typeof Proxy>();
function createProxyViews(
  modelName: string,
  getView: ReturnType<typeof createViewsManager>['getView']
) {
  if (proxyViewsMap.has(modelName)) {
    return proxyViewsMap.get(modelName);
  }
  const target = getView(modelName) || {};
  const proxy = new Proxy<any>(target, getProxyHandler());
  proxyViewsMap.set(modelName, proxy);
  return proxy;
}

// return false => need recomputed, true => use last cache
function compareArguments(prev: any, next: any, compare: ICompare) {
  if (prev === next) {
    // Object address has not changed
    return true;
  }
  const keysChains = compare.keys;
  loopKeysChains: for (let i = 0; i < keysChains.length; i++) {
    let tempPrev = prev;
    let tempNext = next;
    const keys = keysChains[i];
    loopKeys: for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      if (tempNext.hasOwnProperty(key)) {
        tempPrev = tempPrev[key];
        tempNext = tempNext[key];
        if (tempPrev === tempNext) {
          // closet key's object address has not changed
          break loopKeys;
          continue loopKeysChains;
        }
      } else {
        return false;
      }
    }
    if (tempPrev !== tempNext) {
      return false;
    }
  }
  return true;
}

function cacheFactory(
  modelName: string,
  dependencies: string[],
  fn: (...args: any[]) => void,
  getView: ReturnType<typeof createViewsManager>['getView']
) {
  const stateCompare = {
    keys: [],
    values: new Map()
  };

  const rootStateCompare = {
    keys: [],
    values: new Map()
  };

  const viewsCompare = {
    new: new Map<string, any>(),
    viewsProxy: new Proxy({}, {})
  };

  return createSelector(
    // @ts-ignore todo: typescript
    state => state[modelName],
    state => {
      const result: Record<string, any> = {};
      // generate rootState by dependencies
      dependencies.forEach(function (dep) {
        // @ts-ignore todo: typescript
        result[dep] = state[dep];
      });
      // result must be a object
      return result;
    },
    (_state, otherArgs) => otherArgs,
    (state, rootState, otherArgs) => {
      // reset compare
      stateCompare.keys = [];
      stateCompare.values.clear();
      rootStateCompare.keys = [];
      rootStateCompare.values.clear();
      viewsCompare.new.clear();

      compareStatePos = stateCompare;
      const tempState = createProxyObj(state, getStateCollection);

      compareRootStatePos = rootStateCompare;
      const tempRootStateProxy = createProxyObj(
        rootState,
        getRootStateCollection
      );

      let tempOtherArgs = otherArgs;

      viewsStatePos = viewsCompare;
      viewsCompare.viewsProxy = createProxyViews(modelName, getView)!;
      const tempViewsProxy = viewsCompare.viewsProxy;
      isCollectionKeys = true; // just keep collection keys when fn call
      const res = fn.call(
        tempViewsProxy,
        tempState,
        tempRootStateProxy,
        tempViewsProxy,
        tempOtherArgs
      );
      isCollectionKeys = false;
      generateCompareKeys(stateCompare); // collection keys by compare's values
      generateCompareKeys(rootStateCompare);
      // console.log('modelName=>', modelName, stateCompare, rootStateCompare, viewsCompare);
      return res;
    },
    {
      equalityCheck: (prev: any, next: any, argsIndex: number) => {
        let res = true;
        if (argsIndex === 0) {
          // stateCompare
          res = compareArguments(prev, next, stateCompare);
        } else if (argsIndex === 1) {
          // rootStateCompare
          res = compareArguments(prev, next, rootStateCompare);
        } else if (argsIndex === 2) {
          // otherArgsCompare
          if (prev !== next) {
            res = false;
          }
          if (res) {
            // viewsCompare
            const proxyKeysMap = viewsCompare.new;
            const viewsProxy = viewsCompare.viewsProxy as Record<string, any>;
            for (const [key, value] of proxyKeysMap.entries()) {
              if (value !== viewsProxy[key]) {
                res = false;
                break;
              }
            }
          }
        }
        return res;
      }
    }
  );
}

const createViewsManager = (store: Store) => {
  const viewsModelsMap = new Map<
    string,
    Record<string, (...args: any[]) => any>
  >();
  const getView = function (name: string) {
    return viewsModelsMap.get(name);
  };
  const addView = function (model: InternalModel<any, any, any, any, any>) {
    const views = model.views;
    const name = model.name;
    const dependencies =
      (model._rootModels &&
        Object.values(model._rootModels).map(
          m => (m as { name: string }).name
        )) ||
      [];
    if (views) {
      const proxyObj: Record<string, any> = {};
      Object.keys(views || {}).forEach((selectorName: string) => {
        const cacheFun = cacheFactory(
          name,
          dependencies,
          views[selectorName],
          getView
        );
        proxyObj[selectorName] = function (args: any) {
          const state = store.getState();
          return cacheFun(state, args);
        };
      });
      viewsModelsMap.set(name, proxyObj);
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
  selector?: (state: any, views: any) => any
) {
  const modelState = store.getState()[modelName];
  const ModelViews = viewsManager.getView(modelName);
  if (!selector) {
    return modelState;
  }
  return selector(modelState, ModelViews);
}

export { createViewsManager, getStateOrViews };
