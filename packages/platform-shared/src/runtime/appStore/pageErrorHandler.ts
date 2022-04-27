import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getStoreManager } from './getModelsManager';
import { error, IPageError } from './models';

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export function getErrorHandler(
  modelManager: ReturnType<typeof getStoreManager>
): {
  errorHandler: IErrorHandler;
  reset: () => void;
} {
  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const errorStore = modelManager.get(error);
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
      errorStore.dispatch.update(payload);
    },
    reset() {
      const errorStore = modelManager.get(error);
      const { hasError } = errorStore.getState();
      if (!hasError) {
        return;
      }
      errorStore.dispatch.reset();
    }
  };
}
