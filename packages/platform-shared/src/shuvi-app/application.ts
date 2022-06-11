import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';
import {
  IApplication,
  IApplicationOptions,
  IAppContext
} from '../runtime/applicationTypes';
import { default as _application } from '../runtime/application';

export default function application<Context extends IAppContext>(
  options: IApplicationOptions<Context>
): IApplication {
  const application = _application({
    ...options,
    plugins: pluginRecord,
    inlinePlugin: customRuntime
  });
  return application;
}
