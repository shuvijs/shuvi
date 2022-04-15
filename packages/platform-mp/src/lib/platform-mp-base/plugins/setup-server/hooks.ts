import { createSyncHook } from '@shuvi/hook';
import { IServerMiddleware } from '@shuvi/service';

export const addMiddleware = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();

export const extendedHooks = {
  addMiddleware
};
