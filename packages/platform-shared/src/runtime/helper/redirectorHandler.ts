import { getModelManager, redirectModel } from '../store';

export function getRedirector(
  modelManager: ReturnType<typeof getModelManager>
) {
  const redirectStore = modelManager.get(redirectModel);
  const handler = (first?: number | string, second?: string) => {
    if (redirectStore.$state().redirected) {
      return;
    }

    if (!first) {
      return;
    }

    let firstType = typeof first;
    let secondType = typeof second;
    if (firstType === 'number' && secondType === 'string') {
      redirectStore.update({
        redirected: true,
        status: first as number,
        path: second as string
      });
    } else if (firstType === 'string' && secondType === 'undefined') {
      redirectStore.update({
        redirected: true,
        path: first as string
      });
    }
  };
  const reset = () => {
    redirectStore.reset();
  };
  return {
    handler,
    reset,
    get redirected() {
      return redirectStore.$state().redirected;
    },
    get state() {
      const { path, status } = redirectStore.$state();
      return {
        path,
        status
      };
    }
  };
}
