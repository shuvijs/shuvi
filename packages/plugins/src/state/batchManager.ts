import { unstable_batchedUpdates } from 'react-dom';

const createBatchManager = () => {
  // Models are in using now
  const usingModelsMap = new Map<string, Set<() => void>>();

  // add models to listen
  // when name === '', mean global state listen;
  const addSubsribe = function (name: string, fn?: () => void) {
    let modelsFnSet = usingModelsMap.get(name);
    if (!modelsFnSet) {
      modelsFnSet = new Set();
      fn && modelsFnSet.add(fn);
      usingModelsMap.set(name, modelsFnSet);
    } else {
      fn && modelsFnSet.add(fn);
    }
    return function () {
      return fn && removeSubsribe(name, fn);
    };
  };

  // remove models to listen
  const removeSubsribe = function (name: string, fn: () => void) {
    let modelsFnSet = usingModelsMap.get(name);
    if (!modelsFnSet) {
      return;
    }
    modelsFnSet.delete(fn);
  };

  // listen to models in using
  const triggerSubsribe = function (name: string) {
    const nameScopeSubsribes = usingModelsMap.get(name) || [];
    // '' is global model name
    const globalSubsribe = usingModelsMap.get('') || [];

    const updateList: (() => void)[] = [
      ...globalSubsribe,
      ...nameScopeSubsribes
    ];

    unstable_batchedUpdates(() => {
      let update: (() => void) | undefined = updateList.shift();

      while (update) {
        update();

        update = updateList.shift();
      }
    });
  };

  const hasInitModel = function (name: string) {
    return !!usingModelsMap.get(name);
  };

  return {
    addSubsribe,
    removeSubsribe,
    triggerSubsribe,
    hasInitModel
  };
};

export { createBatchManager };
