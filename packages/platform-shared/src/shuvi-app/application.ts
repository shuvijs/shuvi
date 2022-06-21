import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';
import loaders from '@shuvi/app/files/page-loaders';
import { loaderOptions } from '@shuvi/app/files/routerConfig';
import {
  IApplication,
  IApplicationOptions,
  IAppContext
} from '../runtime/applicationTypes';
import { default as _application } from '../runtime/application';

type Options<Context extends IAppContext> = Omit<
  IApplicationOptions<Context>,
  'loaders' | 'loaderOptions'
>;

export default function application<Context extends IAppContext>({
  router,
  ...rest
}: Options<Context>): IApplication {
  const application = _application({
    ...rest,
    router,
    loaders,
    loaderOptions,
    plugins: pluginRecord,
    inlinePlugin: customRuntime
  });
  return application;
}
