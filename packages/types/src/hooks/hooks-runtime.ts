import { defineHook, defineEvent } from './helper';

export type IHookInit = defineHook<'init'>;

export type IHookCreateAppContext = defineHook<
  'create-app-context',
  {
    initialValue: object;
  }
>;

export type IHookRender = defineHook<'render'>;

export type IEventRenderDone = defineEvent<'render-done', [any]>;

export type IHookDispose = defineHook<'dispose'>;
