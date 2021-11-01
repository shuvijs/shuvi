import {
  runPlugins,
  Application,
  IApplicationOptions,
  IAppState
} from '@shuvi/runtime-core';
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { IRouter } from '@shuvi/router';
import { IApplicationCreaterContext } from './index';

export default function platform<
  Context extends IApplicationCreaterContext,
  Router extends IRouter = IRouter,
  AppState extends IAppState | undefined = undefined
>(
  options: IApplicationOptions<Context, Router, AppState>,
  isRunPlugins: boolean = true
) {
  const application = new Application(options);
  const tap = application.tap.bind(application);
  if (isRunPlugins) runPlugins({ tap, initPlugins, pluginRecord });
  return application;
}
