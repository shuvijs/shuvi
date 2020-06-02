// import {I } from '@shuvi/hooks'
export type NoInitValue = '$$no-initial-value';

export interface ICallHookOpts<Name extends string = string, InitV = unknown> {
  name: Name;
  bail?: boolean;
  parallel?: boolean;
  initialValue?: InitV;
}

export interface IHookOpts<
  InitValue = NoInitValue,
  Args extends any[] = any[]
> {
  name: string;
  fn: InitValue extends NoInitValue
    ? (...args: Args) => void | Promise<void>
    : (init: InitValue, ...args: Args) => InitValue | Promise<InitValue>;
  before?: string;
  stage?: number;
}

export interface IHookConfig {
  name: string;
  args: any[];
  initialValue: any;
}

export interface IHookable {
  tap<Config extends IHookConfig>(
    hook: Config['name'],
    opts: IHookOpts<Config['initialValue'], Config['args']>
  ): void;
  callHook<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): Promise<unknown[]>;
  callHook<Config extends IHookConfig>(
    options: ICallHookOpts<Config['name'], Config['initialValue']>,
    ...args: Config['args']
  ): Promise<Config['initialValue']>;

  on<Config extends IHookConfig>(
    event: Config['name'],
    listener: (...args: Config['args']) => void
  ): void;
  emitEvent<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): void;
}
