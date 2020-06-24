import { defineHook, defineEvent } from './helper';

export type IHookInit = defineHook<'init'>;

export type IHookCreateAppContext = defineHook<
  'createAppContext',
  {
    initialValue: object;
  }
>;

export type IHookRender = defineHook<'render'>;

export type IHookServerGetPageData = defineHook<'server:getPageData'>;

export type IEventRenderDone = defineEvent<'renderDone', [any]>;

export type IHookDispose = defineHook<'dispose'>;
