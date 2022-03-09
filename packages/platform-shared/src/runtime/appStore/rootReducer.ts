import { combineReducers } from '@shuvi/shared/lib/miniRedux';
import error from './pageError/reducer';

const rootReducer = combineReducers({
  error
});

export default rootReducer;
