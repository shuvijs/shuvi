import { createModel } from '@shuvi/redox';
import type { RootModel } from '.';

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

export const error = createModel<RootModel>()({
  state: DEFAULT_ERRORSTATE as IPageError,
  reducers: {
    update: (state: IPageError, payload: Partial<IPageError> = {}) => {
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
