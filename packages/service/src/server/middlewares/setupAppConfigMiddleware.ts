import { IServerPluginContext } from '../plugin';
import { ShuviRequestHandler } from '../shuviServerTypes';

export const setupAppConfigMiddleware = (
  context: IServerPluginContext
): ShuviRequestHandler => {
  return async (req, _res, next) => {
    const appConfig = context.serverPluginRunner.getAppConfig({ req });
    if (appConfig) {
      if (typeof appConfig.router.basename !== 'string') {
        throw new Error(
          '[ServerPlugin Hook getAppConfig] appConfig.router.basename must be a string'
        );
      }
      context.appConfig = appConfig;
    }
    next();
  };
};
