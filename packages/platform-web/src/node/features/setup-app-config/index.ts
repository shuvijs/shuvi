import { IServerPluginContext, ShuviRequestHandler } from '@shuvi/service';

export const getSetupAppConfigMiddleware = (
  context: IServerPluginContext
): ShuviRequestHandler => {
  return (req, _res, next) => {
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
