import { executeAsyncParallelHook } from './AsyncParallelHook';
import { executeAsyncSeriesHook } from './AsyncSeriesHook';
import { executeAsyncSeriesBailHook } from './AsyncSeriesBailHook';
import { executeAsyncSeriesWaterfallHook } from './AsyncSeriesWaterfallHook';

import { IHookOpts, ICallHookOpts, IHookable, IHookConfig } from './types';
import { insertHook, getHooksFunctions, removeHook } from './utils';

async function callSerailWithInitialValue<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  initialValue: R
): Promise<R> {
  const fns = getHooksFunctions(hooks);

  return executeAsyncSeriesWaterfallHook(fns, initialValue, ...args);
}

async function callSerail<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  bail: boolean
): Promise<R> {
  const thookFn = bail ? executeAsyncSeriesBailHook : executeAsyncSeriesHook;
  const fns = getHooksFunctions(hooks);
  return thookFn(fns, ...args) as Promise<R>;
}

async function callParallel<R = unknown>(
  hooks: IHookOpts[],
  args: any[]
): Promise<R> {
  const fns = getHooksFunctions(hooks);

  return (await (executeAsyncParallelHook(fns, ...args) as any)) as Promise<R>;
}

export class Hookable implements IHookable {
  private _hooks = new Map<string, IHookOpts[]>();

  tap<Config extends IHookConfig = IHookConfig>(
    name: Config['name'],
    hook: IHookOpts<Config['initialValue'], Config['args']>
  ) {
    let hooks = this._hooks.get(name);
    if (!hooks) {
      hooks = [];
      this._hooks.set(name, hooks);
    }

    insertHook(hooks, hook);

    return () => {
      removeHook(hooks!, hook);
    };
  }

  callHook<Config extends IHookConfig = IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): Promise<unknown[]>;
  callHook<Config extends IHookConfig = IHookConfig>(
    options: ICallHookOpts<Config['name'], Config['initialValue']>,
    ...args: Config['args']
  ): Promise<Config['initialValue']>;
  // implement
  async callHook(
    options: string | ICallHookOpts<string>,
    ...args: any[]
  ): Promise<any> {
    const defaultOpts = {
      bail: false,
      parallel: false,
      initialValue: undefined
    };
    let opts: Required<ICallHookOpts>;
    if (typeof options === 'object') {
      opts = {
        ...defaultOpts,
        ...options
      };
    } else {
      opts = {
        ...defaultOpts,
        name: options
      };
    }

    const hasInitialValue = typeof opts.initialValue !== 'undefined';

    const hooks = this._hooks.get(opts.name);
    if (!hooks || hooks.length <= 0) {
      // @ts-ignore no return value
      return hasInitialValue ? opts.initialValue : [];
    }

    if (opts.parallel) {
      return await callParallel(hooks, args);
    } else if (hasInitialValue) {
      return await callSerailWithInitialValue(hooks, args, opts.initialValue);
    } else {
      return await callSerail(hooks, args, opts.bail);
    }
  }

  on<Config extends IHookConfig = IHookConfig>(
    event: Config['name'],
    listener: (...args: Config['args']) => void
  ) {
    return this.tap<any>(event, { name: 'listener', fn: listener });
  }

  emitEvent<Config extends IHookConfig = IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ) {
    this.callHook({ name, parallel: true }, ...args);
  }
}
