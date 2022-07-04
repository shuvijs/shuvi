import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getStoreManager } from './getStoreManager';
import { errorModel, IPageError } from './models';

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export function getErrorHandler(
  storeManager: ReturnType<typeof getStoreManager>
): {
  errorHandler: IErrorHandler;
  reset: () => void;
} {
  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const errorStore = storeManager.get(errorModel);
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
      const errorStore = storeManager.get(errorModel);
      const { hasError } = errorStore.$state;
      if (!hasError) {
        return;
      }
      errorStore.reset();
    }
  };
}
