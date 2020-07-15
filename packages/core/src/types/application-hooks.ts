import { defineHook, defineEvent } from './hookable';

export type IHookInit = defineHook<'init'>;

export type IHookCreateAppContext = defineHook<
  'createAppContext',
  {
    initialValue: object;
  }
>;

export type IHookGetAppComponent = defineHook<
  'getAppComponent',
  {
    initialValue: object;
    args: [object];
  }
>;

export type IHookRender = defineHook<'render'>;

export type IHookServerGetPageData = defineHook<
  'server:getPageData',
  {
    args: [object /* appContext */];
  }
>;

export type IEventRenderDone = defineEvent<'renderDone', [any]>;

export type IHookDispose = defineHook<'dispose'>;
