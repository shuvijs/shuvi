export enum ShuviErrorCode {
  APP_ERROR = 500, //  对应 server 端的 500
  PAGE_NOT_FOUND = 404 //  对应 server 端的 404
}

export const DEFAULTERRORMESSAGE = {
  [ShuviErrorCode.APP_ERROR]: {
    errorDesc: 'Internal Server Error.',
  },
  [ShuviErrorCode.PAGE_NOT_FOUND]: {
    errorDesc: 'This page could not be found.',
  }
}

export interface IPageError {
  errorCode: ShuviErrorCode | undefined;
  errorDesc?: string;
}
export type IPageErrorFn =
  ((errorCode?: ShuviErrorCode | string, errorDesc?: string ) => void)

export interface IPageErrorHandler extends IPageError {
  handler: IPageErrorFn;
  hasCalled: Boolean;
}

export function createError(): IPageErrorHandler {
  const pageError = {
    title: undefined,
    errorCode: undefined,
    errorDesc: undefined
  } as unknown as IPageErrorHandler;

  pageError.handler = (
    errorCode?: ShuviErrorCode | string,
    errorDesc?: string,
  ) => {
    if (pageError.errorCode !== undefined) {
      return pageError;
    }
    if (typeof errorCode === 'number') {
      pageError.errorCode = errorCode;
      pageError.errorDesc = errorDesc;
    } else {
      pageError.errorCode = ShuviErrorCode.APP_ERROR;
      pageError.errorDesc = errorCode;
    }
    return pageError;
  };

  return pageError;
}
