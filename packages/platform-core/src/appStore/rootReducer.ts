import { combineReducers } from './miniRedux';
import error from './pageError/reducer';

const rootReducer = combineReducers({
  error
});

export default rootReducer;
