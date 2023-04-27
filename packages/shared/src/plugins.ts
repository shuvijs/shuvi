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

export type PluginOptions = {
  name?: _PluginOptions['name'];
  before?: _PluginOptions['before'];
  after?: _PluginOptions['after'];
  conflict?: _PluginOptions['conflict'];
  required?: _PluginOptions['required'];
};

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
    opt: PluginOptions = {}
  ): _PluginOptions => {
    const { name, before, after, conflict, required } = opt;
    const result: _PluginOptions = {
      group
    };
    // avoid undefined value because undefined value will override default value
    if (name !== undefined) {
      result.name = name;
    }
    if (before !== undefined) {
      result.before = before;
    }
    if (after !== undefined) {
      result.after = after;
    }
    if (conflict !== undefined) {
      result.conflict = conflict;
    }
    if (required !== undefined) {
      result.required = required;
    }
    return result;
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
