import { RESET_ERROR, UPDATE_ERROR, IPageErrorAction } from './actions';

const DEFAULTERRORSTATE = {
  errorCode: undefined,
  errorDesc: undefined
};

const error = (state = DEFAULTERRORSTATE, action: IPageErrorAction) => {
  switch (action.type) {
    case RESET_ERROR:
      return {
        ...DEFAULTERRORSTATE
      };
    case UPDATE_ERROR:
      return {
        ...state,
        ...(action.payload ? action.payload : {})
      };
    default:
      return state;
  }
};

export default error;
