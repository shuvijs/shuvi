import {
  AsyncParallelHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} from 'tapable';
import { IHookOpts, ICallHookOpts } from '@shuvi/types';

async function callSerailWithInitialValue<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  initialValue: R
): Promise<R> {
  const thook = new AsyncSeriesWaterfallHook(['memo']);
  for (const hook of hooks) {
    thook.tapPromise(
      {
        name: hook.name,
        stage: hook.stage || 0,
        // @ts-ignore
        before: hook.before
      },
      async (memo: any) => {
        return await hook.fn(memo, ...args);
      }
    );
  }
  return await thook.promise(initialValue);
}

async function callSerail<R = unknown>(
  hooks: IHookOpts[],
  args: any[],
  bail: boolean
): Promise<R> {
  const thook = bail ? new AsyncSeriesBailHook() : new AsyncSeriesHook();
  for (const hook of hooks) {
    thook.tapPromise(
      {
        name: hook.name,
        stage: hook.stage || 0,
        // @ts-ignore
        before: hook.before
      },
      async () => {
        return await hook.fn(...args);
      }
    );
  }
  return await thook.promise();
}

async function callParallel<R = unknown>(
  hooks: IHookOpts[],
  args: any[]
): Promise<R> {
  const thook = new AsyncParallelHook();
  const memo: any[] = [];
  for (const hook of hooks) {
    thook.tapPromise(
      {
        name: hook.name,
        stage: hook.stage || 0,
        // @ts-ignore
        before: hook.before
      },
      async () => {
        memo.push(await hook.fn(...args));
      }
    );
  }
  await thook.promise();
  return (memo as any) as R;
}

export class Hooks {
  private _hooks = new Map<string, IHookOpts[]>();

  constructor() {}

  addHook(name: string, hook: IHookOpts<any, any[]>) {
    let hooks = this._hooks.get(name);
    if (!hooks) {
      hooks = [];
      this._hooks.set(name, hooks);
    }

    hooks.push(hook);
  }

  async callHook<R = unknown>(name: string, ...args: any[]): Promise<R>;
  async callHook<R = unknown>(
    options: ICallHookOpts,
    ...args: any[]
  ): Promise<R>;
  async callHook<R = unknown>(
    options: string | ICallHookOpts,
    ...args: any[]
  ): Promise<R> {
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
      return await callParallel<R>(hooks, args);
    } else if (hasInitialValue) {
      return await callSerailWithInitialValue<R>(
        hooks,
        args,
        opts.initialValue as any
      );
    } else {
      return await callSerail<R>(hooks, args, opts.bail);
    }
  }
}
