import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { IPageError, RESET_ERROR, UPDATE_ERROR } from './pageError/actions';
import { IAppStore } from './getAppStore';

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
      const payload = {} as IPageError;
      if (typeof errorCode === 'number') {
        payload.errorCode = errorCode;
        payload.errorDesc = errorDesc;
      } else {
        payload.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
        payload.errorDesc = errorCode;
      }
      appStore.dispatch({
        type: UPDATE_ERROR,
        payload
      });
    },
    reset() {
      appStore.dispatch({
        type: RESET_ERROR
      });
    }
  };
}
