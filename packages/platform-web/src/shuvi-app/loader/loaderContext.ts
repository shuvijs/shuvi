import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import {
  IErrorHandler,
  IPageError,
  getModelManager,
  redirectModel
} from '@shuvi/platform-shared/esm/runtime';

export interface IPageErrorHandler extends IPageError {
  handler: IErrorHandler['errorHandler'];
}

export function createError(): IPageErrorHandler {
  const pageError = {
    errorCode: undefined,
    errorDesc: undefined
  } as unknown as IPageErrorHandler;

  pageError.handler = (
    errorCode?: SHUVI_ERROR_CODE | string,
    errorDesc?: string
  ) => {
    if (pageError.errorCode !== undefined) {
      return pageError;
    }
    if (typeof errorCode === 'number') {
      pageError.errorCode = errorCode;
      pageError.errorDesc = errorDesc;
    } else {
      pageError.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
      pageError.errorDesc = errorCode;
    }
    return pageError;
  };

  return pageError;
}

/** make redirector be reusable at different places */
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
