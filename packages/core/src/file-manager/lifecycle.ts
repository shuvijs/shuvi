import { pauseTracking, resetTracking } from '@vue/reactivity';
import { callWithErrorHandling } from './errorHandling';
import {
  FileLifecycleHooks,
  FileInternalInstance,
  currentInstance,
  setCurrentInstance
} from './file';

export function injectHook(
  type: FileLifecycleHooks,
  hook: Function & { __weh?: Function },
  target: FileInternalInstance | null = currentInstance,
  prepend: boolean = false
): Function | undefined {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    // cache the error handling wrapper for injected hooks so the same hook
    // can be properly deduped by the scheduler. "__weh" stands for "with error
    // handling".
    const wrappedHook =
      hook.__weh ||
      (hook.__weh = (...args: unknown[]) => {
        if (target.isUnmounted) {
          return;
        }
        // disable tracking inside all lifecycle hooks
        // since they can potentially be called inside effects.
        pauseTracking();
        // Set currentInstance during hook invocation.
        // This assumes the hook does not synchronously trigger other hooks, which
        // can only be false when the user does something really funky.
        setCurrentInstance(target);
        const res = callWithErrorHandling(hook, args);
        setCurrentInstance(null);
        resetTracking();
        return res;
      });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }

  return undefined;
}

export const createHook = <T extends Function = () => any>(
  lifecycle: FileLifecycleHooks
) => (hook: T, target: FileInternalInstance | null = currentInstance) =>
  injectHook(lifecycle, hook, target);

export const onMounted = createHook('mounted');
export const onUnmounted = createHook('unmounted');
