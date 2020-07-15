import { IHookConfig, NoInitValue } from './hookable';

export type {
  NoInitValue,
  IHookable,
  ICallHookOpts,
  IHookOpts,
  IHookConfig
} from '@shuvi/hooks';

type IDefaultHookConfig = {
  args: [];
  initialValue: NoInitValue;
};

export type defineHook<
  Name extends string,
  Config extends Partial<IHookConfig> = {}
> = {
  name: Name;
} & {
  [K in keyof Config]: Config[K];
} &
  {
    [K in Exclude<
      keyof IDefaultHookConfig,
      keyof Config
    >]: IDefaultHookConfig[K];
  };

export type defineEvent<Name extends string, Args = []> = {
  name: Name;
  args: Args;
  initialValue: NoInitValue;
};
