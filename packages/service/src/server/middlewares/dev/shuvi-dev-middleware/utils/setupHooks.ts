import { IContext, MultiStats, Stats } from '../types';

export default function setupHooks(context: IContext) {
  function done(stats: MultiStats | Stats) {
    context.state = true;
    context.stats = stats;

    // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
    process.nextTick(() => {
      const { callbacks } = context;
      context.callbacks = [];

      callbacks.forEach(callback => {
        callback(stats);
      });
    });
  }
  context.compiler.hooks.done.tap('shuvi-dev-middleware', done);
}
