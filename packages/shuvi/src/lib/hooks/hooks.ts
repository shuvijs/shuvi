import {
  Hook,
  AsyncParallelBailHook,
  AsyncParallelHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} from "tapable";
import { IHookOpts, ICallHookOpts } from "@shuvi/types";

export class Hooks {
  private _hooks = new Map<string, IHookOpts[]>();

  constructor() {}

  addHook(name: string, hook: IHookOpts) {
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
    if (typeof options === "object") {
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

    const hasInitialValue = typeof opts.initialValue !== "undefined";

    const hooks = this._hooks.get(opts.name);
    if (!hooks || hooks.length <= 0) {
      // @ts-ignore no return value
      return hasInitialValue ? opts.initialValue : [];
    }

    let thook: Hook;
    if (opts.bail && opts.parallel) {
      thook = new AsyncParallelBailHook();
    } else if (opts.bail) {
      thook = new AsyncSeriesBailHook();
    } else if (opts.parallel) {
      thook = new AsyncParallelHook();
    } else {
      thook = new AsyncSeriesWaterfallHook(["memo"]);
    }

    if (hasInitialValue) {
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
      return await thook.promise(opts.initialValue);
    }

    for (const hook of hooks) {
      thook.tapPromise(
        {
          name: hook.name,
          stage: hook.stage || 0,
          // @ts-ignore
          before: hook.before
        },
        opts.parallel
          ? async () => hook.fn(...args)
          : async (memo: any[]) => {
              const items = await hook.fn(...args);
              return memo.concat(items);
            }
      );
    }
    return await thook.promise([]);
  }
}
