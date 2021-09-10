import { runPlugins, Application as ApplicationCore, IApplicationOptions, IApplication } from '@shuvi/runtime-core'
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';
export { IApplication }
export class Application<Context extends {}> extends ApplicationCore<Context> {
  constructor(options: IApplicationOptions<Context>) {
    super(options);
    const tap = this.tap.bind(this);
    runPlugins({ tap, initPlugins, pluginRecord });
  }
}