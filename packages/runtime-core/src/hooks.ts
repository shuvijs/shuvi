import { defineHook, defineEvent } from '@shuvi/hook';

export type IHookInit = defineHook<'init'>;

export type IHookCreateAppContext = defineHook<
  'createAppContext',
  {
    initialValue: object;
  }
>;

export type IHookGetRootAppComponent = defineHook<
  'getRootAppComponent',
  {
    initialValue: object;
    args: [object];
  }
>;

export type IHookGetAppComponent = defineHook<
  'getAppComponent',
  {
    initialValue: object;
    args: [object];
  }
>;

export type IHookServerGetPageData = defineHook<
  'server:getPageData',
  {
    args: [object /* appContext */];
  }
>;

export type IEventRenderDone = defineEvent<'renderDone', [any]>;

export type IHookDispose = defineHook<'dispose'>;
