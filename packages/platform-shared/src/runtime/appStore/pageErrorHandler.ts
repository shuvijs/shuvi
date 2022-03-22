import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { IAppStore, IAppState } from './getAppStore';

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export function getErrorHandler(appStore: IAppStore): {
  errorHandler: IErrorHandler;
  reset: () => void;
} {
  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const payload = {
        hasError: true
      } as IAppState['error'];
      if (typeof errorCode === 'number') {
        payload.errorCode = errorCode;
        payload.errorDesc = errorDesc;
      } else {
        payload.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
        payload.errorDesc = errorCode;
      }
      appStore.dispatch.error.update(payload);
    },
    reset() {
      const { hasError } = appStore.getState().error;
      if (!hasError) {
        return;
      }
      appStore.dispatch.error.reset();
    }
  };
}
