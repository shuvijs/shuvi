import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

export interface IPageError {
  errorCode: SHUVI_ERROR_CODE | undefined;
  errorDesc?: string;
  isDefault: boolean;
}

export const RESET_ERROR = 'RESET_ERROR';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export type IPageErrorAction =
  | {
      type: typeof RESET_ERROR;
    }
  | {
      type: typeof UPDATE_ERROR;
      payload?: Partial<IPageError>;
    };
