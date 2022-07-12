import { defineModel } from '@shuvi/redox';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { IErrorState, IError } from '../applicationTypes';

const DEFAULT_ERRORSTATE = {
  error: undefined
} as IErrorState;

export const errorModel = defineModel({
  name: 'error',
  state: DEFAULT_ERRORSTATE,
  reducers: {
    setError(_state, error?: IError) {
      return {
        ..._state,
        error: error
      };
    }
  },
  actions: {
    error(payload?: IError) {
      this.setError(payload || SHUVI_ERROR.APP_ERROR);
    },
    clear() {
      if (this.hasError) {
        this.setError(undefined);
      }
    }
  },
  views: {
    getError() {
      return this.error;
    },
    hasError() {
      return typeof this.error !== 'undefined';
    }
  }
});

export type ErrorModel = typeof errorModel;
