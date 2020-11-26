/*
 * Files created right before watching starts make watching fire multiple times
 * This plugin fix it according to this comment:
 *  https://github.com/webpack/watchpack/issues/25#issuecomment-319292564
 *
 * Related Issues:
 *  https://github.com/webpack/webpack/issues/7997
 */
import { Compiler, Plugin } from 'webpack';

const TIME_FIX = 5000;

const PLUGIN_NAME = 'fix-watching-plugin';

export default class FixWatchingPlugin implements Plugin {
  apply(compiler: Compiler) {
    let watching: any;
    let restored: boolean = false;

    const aspectWatch = compiler.watch;
    compiler.watch = function (...args) {
      watching = aspectWatch.apply(compiler, args);
      watching.startTime += TIME_FIX;
      return watching;
    };

    compiler.hooks.done.tap(PLUGIN_NAME, stats => {
      if (watching && !restored) {
        stats.compilation.startTime -= TIME_FIX;
        restored = true;
      }
    });
  }
}
