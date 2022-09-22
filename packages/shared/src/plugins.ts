import {
  createPlugin,
  HookMap,
  Setup,
  IPluginHandlers,
  PluginOptions as _PluginOptions,
  IPluginInstance
} from '@shuvi/hook';

export const GROUP_BEFORE_USER = -1;
export const GROUP_USER = 0;
export const GROUP_AFTER_USER = 1;

export type PluginOptions = Omit<_PluginOptions, 'group' | 'order'>;

export interface PluginFunc<HM extends HookMap, C> {
  (
    handler: IPluginHandlers<HM, C> & {
      setup?: Setup;
    },
    options?: PluginOptions
  ): IPluginInstance<HM, C>;
}

export interface CreatePluginByGroup<HM extends HookMap, C> {
  createPluginBefore: PluginFunc<HM, C>;
  createPlugin: PluginFunc<HM, C>;
  createPluginAfter: PluginFunc<HM, C>;
}

export function createPluginCreator<
  HM extends HookMap,
  C
>(): CreatePluginByGroup<HM, C> {
  const createOptions = (
    group: number,
    opt: _PluginOptions = {}
  ): PluginOptions => {
    return {
      name: opt.name,
      pre: opt.pre,
      post: opt.post,
      rivals: opt.rivals,
      required: opt.required,
      group
    };
  };

  return {
    createPluginBefore(handler, options) {
      return createPlugin<HM, C>(
        handler,
        createOptions(GROUP_BEFORE_USER, options)
      );
    },
    createPlugin(handler, options) {
      return createPlugin<HM, C>(handler, createOptions(GROUP_USER, options));
    },
    createPluginAfter(handler, options) {
      return createPlugin<HM, C>(
        handler,
        createOptions(GROUP_AFTER_USER, options)
      );
    }
  };
}
