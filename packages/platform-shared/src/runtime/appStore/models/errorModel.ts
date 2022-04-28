import { defineModel } from '@shuvi/redox';

import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

export interface IPageError {
  errorCode: SHUVI_ERROR_CODE | undefined;
  errorDesc?: string;
  hasError: boolean;
}

const DEFAULT_ERRORSTATE = {
  errorCode: undefined,
  errorDesc: undefined,
  hasError: false
};

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
  }
});
