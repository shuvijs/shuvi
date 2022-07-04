import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getModelManager, errorModel, IPageError } from '../store';

const isServer = typeof window === 'undefined';

export interface IPageErrorHandler extends IPageError {
  handler: IErrorHandler['errorHandler'];
}

export type IErrorHandlerFn = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export interface IErrorHandler {
  errorHandler: IErrorHandlerFn;
  reset: () => void;
  resetErrorState: () => void;
}

let errorHandler: IErrorHandler;

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

function createErrorHanlder(modelManager: ReturnType<typeof getModelManager>) {
  const errorStore = modelManager.get(errorModel);
  let shouldReset = false;

  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const { hasError } = errorStore.$state();
      if (hasError) {
        return;
      }

      shouldReset = false;
      const payload = {
        hasError: true
      } as IPageError;
      if (typeof errorCode === 'number') {
        payload.errorCode = errorCode;
        payload.errorDesc = errorDesc;
      } else {
        payload.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
        payload.errorDesc = errorCode;
      }
      errorStore.update(payload);
    },
    reset() {
      shouldReset = true;
    },
    resetErrorState() {
      const { hasError } = errorStore.$state();
      if (hasError && shouldReset) {
        errorStore.reset();
      }
      shouldReset = false;
    }
  };
}

export function getErrorHandler(
  modelManager: ReturnType<typeof getModelManager>
): IErrorHandler {
  if (isServer) {
    return createErrorHanlder(modelManager);
  }

  if (!errorHandler) {
    errorHandler = createErrorHanlder(modelManager);
  }

  return errorHandler;
}
