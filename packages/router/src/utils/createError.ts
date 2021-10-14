export enum ShuviErrorCode {
  APP_ERROR = 500, //  对应 server 端的 500
  PAGE_NOT_FOUND = 404 //  对应 server 端的 404
}

export interface IPageError {
  title: string;
  errorCode: ShuviErrorCode;
  errorDesc: string;
}
export type IPageErrorFn =
  | ((errorCode: ShuviErrorCode, errorDesc?: string, title?: string) => void)
  | ((errorDesc?: string, title?: string) => void);
export interface IPageErrorHandler extends IPageError {
  handler: IPageErrorFn;
  hasCalled: Boolean;
}

export function createError(): IPageErrorHandler {
  const pageError = {
    hasCalled: false,
    title: '',
    errorCode: undefined,
    errorDesc: ''
  } as unknown as IPageErrorHandler;

  pageError.handler = (
    errorCode?: ShuviErrorCode,
    errorDesc?: string,
    title?: string
  ) => {
    if (pageError.hasCalled) {
      return pageError;
    }
    if (typeof errorCode === 'number') {
      pageError.errorCode = errorCode;
      pageError.errorDesc = errorDesc || '';
      pageError.title = title || '';
    } else {
      pageError.errorCode = ShuviErrorCode.APP_ERROR;
      pageError.errorDesc = errorCode || '';
      pageError.title = errorDesc || '';
    }
    pageError.hasCalled = true;
    return pageError;
  };

  return pageError;
}
