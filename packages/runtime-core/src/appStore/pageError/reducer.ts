import { RESET_ERROR, UPDATE_ERROR, IPageErrorAction } from './actions';
import { DEFAULT_ERRORSTATE } from '../constants';

const error = (state = DEFAULT_ERRORSTATE, action: IPageErrorAction) => {
  switch (action.type) {
    case RESET_ERROR:
      return {
        ...DEFAULT_ERRORSTATE
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
