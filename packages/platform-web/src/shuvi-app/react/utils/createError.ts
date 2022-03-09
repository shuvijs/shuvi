import { IErrorHandler, IAppState } from '@shuvi/platform-shared/esm/runtime';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

type IPageError = IAppState['error'];

export interface IPageErrorHandler extends IPageError {
  handler: IErrorHandler;
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
