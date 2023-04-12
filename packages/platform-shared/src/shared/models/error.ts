import { defineModel } from 'doura';
import { IErrorState, IError } from '../applicationTypes';

const DEFAULT_ERROR_STATE = {
  error: null
} as IErrorState;

export const errorModelName = 'error';

export const errorModel = defineModel({
  state: DEFAULT_ERROR_STATE,
  actions: {
    set(error: IError) {
      this.error = error;
    },
    clear() {
      if (this.hasError) {
        this.error = null;
      }
    }
  },
  views: {
    errorObject() {
      return this.error;
    },
    hasError() {
      return this.error !== null;
    }
  }
});

export type ErrorModel = typeof errorModel;
