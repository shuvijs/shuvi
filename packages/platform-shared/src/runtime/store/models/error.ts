import { defineModel } from '@shuvi/redox';

import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

export interface IPageError {
  errorCode?: SHUVI_ERROR_CODE;
  errorDesc?: string;
}

const DEFAULT_ERRORSTATE = {};

export const errorModel = defineModel({
  name: 'error',
  state: DEFAULT_ERRORSTATE as IPageError,
  reducers: {
    update: (state, payload: Partial<IPageError> = {}) => {
      return {
        ...state,
        ...payload
      };
    },
    reset() {
      return DEFAULT_ERRORSTATE;
    }
  },
  effects: {
    error(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const payload = {} as IPageError;
      if (typeof errorCode === 'number') {
        payload.errorCode = errorCode;
        payload.errorDesc = errorDesc;
      } else {
        payload.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
        payload.errorDesc = errorCode;
      }
      this.update(payload);
    }
  }
});
