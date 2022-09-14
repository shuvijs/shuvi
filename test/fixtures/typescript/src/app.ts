import {
  InitFunction,
  AppComponentFunction,
  AppContextFunction,
  DisposeFunction
} from '@shuvi/runtime/app';

export const init: InitFunction = () => {
  // do nothing
};

export const appComponent: AppComponentFunction = async UserApp => {
  return UserApp;
};

export const appContext: AppContextFunction = _context => {
  // do nothing
};

export const dispose: DisposeFunction = () => {
  // do nothing
};
