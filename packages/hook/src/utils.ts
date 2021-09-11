import { IHookOpts } from './types';

export const getHooksFunctions = (hooks: IHookOpts[]) => {
  return hooks.map(({ fn, name }) => {
    fn.hookName = name;
    return fn;
  });
};

// mutable sort
export const insertHook = (hooks: IHookOpts[], hook: IHookOpts) => {
  let before;

  if (typeof hook.before === 'string') {
    before = new Set([hook.before]);
  }

  let stage = 0;
  if (typeof hook.stage === 'number') {
    stage = hook.stage;
  }

  const originalHooksLength = hooks.length;

  if (hooks.length > 1) {
    for (let i = 1; i < originalHooksLength; i++) {
      const tap = hooks[i];
      const tapStage = tap.stage || 0;

      if (before) {
        if (before.has(tap.name)) {
          hooks.splice(i, 0, hook);
          break;
        }
      }
      if (tapStage > stage) {
        hooks.splice(i, 0, hook);
        break;
      }
    }
  }

  if (hooks.length === originalHooksLength) {
    hooks.push(hook);
  }

  return hooks;
};

// mutable way
export const removeHook = (hooks: IHookOpts[], hookToRemove: IHookOpts) => {
  const indexToRemove = hooks.findIndex(hook => hook === hookToRemove);
  if (indexToRemove >= 0) {
    hooks.splice(indexToRemove, 1);
  }
};
