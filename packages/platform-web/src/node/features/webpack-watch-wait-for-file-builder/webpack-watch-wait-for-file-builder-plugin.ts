import { IPluginContext } from '@shuvi/service';

import { Compiler, Plugin } from '@shuvi/toolpack/lib/webpack';

type Options = {
  onBuildStart: IPluginContext['onBuildStart'];
  onBuildEnd: IPluginContext['onBuildEnd'];
};

export default class WebpackWatchWaitForFileBuilderPlugin implements Plugin {
  options: Options;
  constructor(options: Options) {
    this.options = options;
  }
  apply(compiler: Compiler) {
    const { onBuildEnd, onBuildStart } = this.options;
    /**
     * watching.suspend will pause the real action in the watcher handler but still collecting changed files.
     * watching.resume will resume its action
     *
     * We make sure onBuildStart is faster than webpack's watcher and make it suspend.
     *
     * And resume when onBuildEnd.
     *
     * In this way, during build of fileBuilder, webpack will not trigger any watchRun event but keep watching changed files.
     */
    onBuildStart(() => {
      compiler.watching.suspend();
    });
    onBuildEnd(({ buildStatus }) => {
      if (buildStatus === 'fulfilled') {
        setTimeout(() => {
          compiler.watching.resume();
          // FIXME: timeout for resuming need further investigation
        }, 100);
      }
    });
  }
}
