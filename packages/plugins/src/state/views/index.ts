import { createSelector } from './createSelector';
import { isComplexObject } from '../utils';
import { Store } from '../types';
import { InternalModel } from '../model';

interface ICompare {
  tree: Map<
    Record<string, any>,
    {
      children: Record<string, any>;
    }
  >;
}

interface IViewsCompare {
  new: Map<string, any>;
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
      if (isCollectionKeys) {
        const compareTree = compareStatePos.tree;
        if (compareTree.has(target)) {
          const treeNode = compareTree.get(target);
          treeNode && (treeNode!.children[p] = result);
        } else {
          compareTree.set(target, {
            children: {
              [p]: result
            }
          });
        }
      }
      if (isComplexObject(result)) {
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
      if (isCollectionKeys) {
        const compareTree = compareRootStatePos.tree;
        if (compareTree.has(target)) {
          const treeNode = compareTree.get(target);
          treeNode && (treeNode!.children[p] = result);
        } else {
          compareTree.set(target, {
            children: {
              [p]: result
            }
          });
        }
      }
      if (isComplexObject(result)) {
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

function compareObject(obj: any, compareObj: any, tree: ICompare['tree']) {
  if (!isComplexObject(obj)) {
    return obj === compareObj;
  } else if (obj === compareObj) {
    // Object address has not changed, children are same
    return true;
  }
  if (!tree.has(obj)) {
    return true;
  }
  const treeNode = tree.get(obj);
  const children = treeNode!.children;
  const keys = Object.keys(children);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const childrenObj = children[key];
    if (!compareObject(childrenObj, compareObj[key], tree)) {
      return false;
    }
  }
  return true;
}

// return false => need recomputed, true => use last cache
function compareArguments(next: any, compare: ICompare) {
  const tree = compare.tree;
  const root = [...tree.keys()][0]; // app get root object first so tree root is the Map first
  if (!root) {
    // use nothings
    return true;
  }
  return compareObject(root, next, tree);
}

function cacheFactory(
  modelName: string,
  dependencies: string[],
  fn: (...args: any[]) => void,
  getView: ReturnType<typeof createViewsManager>['getView']
) {
  const stateCompare = {
    tree: new Map()
  };

  const rootStateCompare = {
    tree: new Map()
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
      stateCompare.tree.clear();
      rootStateCompare.tree.clear();
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
      console.log(
        'modelName=>',
        modelName,
        stateCompare,
        rootStateCompare,
        viewsCompare
      );
      return res;
    },
    {
      equalityCheck: (prev: any, next: any, argsIndex: number) => {
        let res = true;
        if (argsIndex === 0) {
          // stateCompare
          res = compareArguments(next, stateCompare);
        } else if (argsIndex === 1) {
          // rootStateCompare
          res = compareArguments(next, rootStateCompare);
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
