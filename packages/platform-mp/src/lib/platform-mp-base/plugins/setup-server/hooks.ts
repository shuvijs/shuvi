import { createSyncHook } from '@shuvi/hook';
import { IServerMiddleware } from '@shuvi/service';

export const middlewares = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();

export const extendedHooks = {
  middlewares
};
