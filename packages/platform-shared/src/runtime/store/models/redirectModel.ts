import { defineModel } from '@shuvi/redox';

export interface IRedirectState {
  redirected: boolean;
  path: string;
  status?: number;
}

const DEFAULT_REDIRECT_STATE: IRedirectState = {
  redirected: false,
  path: ''
};

export const redirectModel = defineModel({
  name: 'redirect',
  state: DEFAULT_REDIRECT_STATE,
  reducers: {
    update: (state, payload: Partial<IRedirectState> = {}) => {
      return {
        ...state,
        ...payload
      };
    },
    reset: () => DEFAULT_REDIRECT_STATE
  }
});
