export enum ShuviErrorCode {
  APP_ERROR = 500, //  对应 server 端的 500
  PAGE_NOT_FOUND = 404 //  对应 server 端的 404
}

const DEFAULTERRORSTATE = {
  errorCode: undefined,
  errorDesc: undefined
};

export const DEFAULTERRORMESSAGE = {
  [ShuviErrorCode.APP_ERROR]: {
    errorDesc: 'Internal Server Error.'
  },
  [ShuviErrorCode.PAGE_NOT_FOUND]: {
    errorDesc: 'This page could not be found.'
  }
};

export interface IPageError {
  errorCode: ShuviErrorCode | undefined;
  errorDesc?: string;
}

export type IErrorHandler = (
  errorCode?: ShuviErrorCode | string,
  errorDesc?: string
) => void;

export class ErrorStore {
  state: IPageError;
  listeners: (() => void)[];

  constructor(defaultState?: IPageError) {
    this.state = defaultState || DEFAULTERRORSTATE;
    this.listeners = [];
  }

  getState = () => {
    return this.state;
  };
  dispatch = ({
    type,
    payload
  }: {
    type: 'reset' | 'update';
    payload?: IPageError;
  }) => {
    const oldErrorCode = this.state.errorCode;
    if (type === 'reset') {
      this.state = {
        ...DEFAULTERRORSTATE
      };
    } else if (type === 'update') {
      this.state = {
        ...this.state,
        ...(payload ? payload : {})
      };
    }
    const newErrorCode = this.state.errorCode;
    if (oldErrorCode !== newErrorCode) {
      for (let i = 0; i < this.listeners.length; i++) {
        const listener = this.listeners[i];
        listener();
      }
    }
    return this.state;
  };

  subscribe(fn: () => void) {
    if (!this.listeners.includes(fn)) {
      this.listeners.push(fn);
    }
  }

  errorHandler: IErrorHandler = (
    errorCode?: ShuviErrorCode | string,
    errorDesc?: string
  ) => {
    const payload = {
      ...DEFAULTERRORSTATE
    } as IPageError;
    if (typeof errorCode === 'number') {
      payload.errorCode = errorCode;
      payload.errorDesc = errorDesc;
    } else {
      payload.errorCode = ShuviErrorCode.APP_ERROR;
      payload.errorDesc = errorCode;
    }
    this.dispatch({
      type: 'update',
      payload
    });
  };

  reset = () => this.dispatch({ type: 'reset' });
}

export const clientErrorStore = new ErrorStore(DEFAULTERRORSTATE);

export interface IPageErrorHandler extends IPageError {
  handler: IErrorHandler;
  hasCalled: Boolean;
}
export function createError(): IPageErrorHandler {
  const pageError = {
    errorCode: undefined,
    errorDesc: undefined
  } as unknown as IPageErrorHandler;

  pageError.handler = (
    errorCode?: ShuviErrorCode | string,
    errorDesc?: string
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
