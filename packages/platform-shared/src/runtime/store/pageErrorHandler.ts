import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getModelManager } from './getModelsManager';
import { errorModel, IPageError } from './models';

const isServer = typeof window === 'undefined';

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

function createErrorHanlder(modelManager: ReturnType<typeof getModelManager>) {
  const errorStore = modelManager.get(errorModel);
  let shouldReset = false;

  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
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
