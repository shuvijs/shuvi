import { reactive, ReactiveEffect } from '@vue/reactivity';
import {
  FileOptions,
  FileInternalInstance,
  FilePublicInstance,
  FileInternalContentFunction
} from './fileTypes';
import { EMPTY_OBJ, extend, hasOwn } from '@shuvi/utils';
import { injectHook } from './file-api/lifecycle';
import { queueJob } from './scheduler';

export * from './fileTypes';

type DataFn = (vm: FilePublicInstance) => any;

export const LifecycleHooks = {
  MOUNTED: 'm',
  UNMOUNTED: 'um'
} as const;

const AccessTypes = {
  DATA: 0,
  PROPS: 1,
  CONTEXT: 2,
  OTHER: 3,
  LISTENERS: 4
};

export let currentInstance: FileInternalInstance | null = null;

export const getCurrentInstance: () => FileInternalInstance | null = () =>
  currentInstance;
// todo 删除了 ｜｜ currentRenderingInstance, 之后补上

export const setCurrentInstance = (instance: FileInternalInstance | null) => {
  currentInstance = instance;
};

// record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordInstanceBoundEffect(effect: ReactiveEffect) {
  if (currentInstance) {
    (currentInstance.effects || (currentInstance.effects = [])).push(effect);
  }
}

type PublicPropertiesMap = Record<string, (i: FileInternalInstance) => any>;

const publicPropertiesMap: PublicPropertiesMap = extend(Object.create(null), {
  $data: i => i.data,
  $forceUpdate: i => () => queueJob(i.update)
} as PublicPropertiesMap);

interface ComponentRenderContext {
  [key: string]: any;
  _: FileInternalInstance;
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: ComponentRenderContext, key: string) {
    const { ctx, data, accessCache } = instance;

    // let @vue/reactivity know it should never observe Vue public instances.
    if (key === '__v_skip' /* ReactiveFlags.SKIP */) {
      return true;
    }

    const publicGetter = publicPropertiesMap[key];
    // public $xxx properties
    if (publicGetter) {
      return publicGetter(instance);
    }

    // data / props / ctx
    // This getter gets called for every property access on the render context
    // during render and is a major hotspot. The most expensive part of this
    // is the multiple hasOwn() calls. It's much faster to do a simple property
    // access on a plain object, so we use an accessCache object (with null
    // prototype) to memoize what access type a key corresponds to.
    if (key[0] !== '$') {
      const n = accessCache![key];
      if (n !== undefined) {
        switch (n) {
          case AccessTypes.DATA:
            return data[key];
          case AccessTypes.CONTEXT:
            return ctx[key];
          // default: just fallthrough
        }
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache![key] = AccessTypes.DATA;
        return data[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache![key] = AccessTypes.CONTEXT;
        return ctx[key];
      }
    }

    if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      // user may set custom properties to `this` that start with `$`
      accessCache![key] = AccessTypes.CONTEXT;
      return ctx[key];
    }
  },

  set(
    { _: instance }: ComponentRenderContext,
    key: string,
    value: any
  ): boolean {
    const { data, ctx } = instance;
    if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
    }

    if (key[0] === '$' && key.slice(1) in instance) {
      return false;
    } else {
      ctx[key] = value;
    }
    return true;
  },

  has({ _: { data, accessCache, ctx } }: ComponentRenderContext, key: string) {
    return (
      accessCache![key] !== undefined ||
      (data !== EMPTY_OBJ && hasOwn(data, key)) ||
      hasOwn(ctx, key) ||
      hasOwn(publicPropertiesMap, key)
    );
  }
};

export function createFileInstance(options: FileOptions): FileInternalInstance {
  const instance: FileInternalInstance = {
    type: options,
    name: options.name,

    content: options.content as FileInternalContentFunction,
    update: null!, // will be set synchronously right after creation
    destroy: null!, // will be set synchronously right after creation
    proxy: null,
    accessCache: {},

    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,

    // lifecycle
    isMounted: false,
    isUnmounted: false,
    mounted: [],
    unmounted: []
  };

  instance.ctx = { _: instance };
  instance.proxy = new Proxy(
    instance.ctx,
    PublicInstanceProxyHandlers
  ) as FilePublicInstance;

  currentInstance = instance;
  applyOptions(instance, options);
  currentInstance = null;

  return instance;
}

function applyOptions(instance: FileInternalInstance, options: FileOptions) {
  const publicThis = instance.proxy!;
  const {
    data: dataOptions,
    methods: methodsOptions,

    // lifecycle
    mounted,
    unmounted
  } = options;
  const ctx = instance.ctx;
  if (dataOptions) {
    resolveData(instance, dataOptions, publicThis);
  }

  if (methodsOptions) {
    const publicThis = instance.proxy;
    for (const key in methodsOptions) {
      // todo: check duplicated
      ctx[key] = methodsOptions[key].bind(publicThis);
    }
  }

  if (mounted) {
    injectHook('mounted', mounted.bind(publicThis));
  }
  if (unmounted) {
    injectHook('unmounted', unmounted.bind(publicThis));
  }
}

function resolveData(
  instance: FileInternalInstance,
  dataFn: DataFn,
  publicThis: FilePublicInstance
) {
  const data = dataFn.call(publicThis, publicThis);
  instance.data = reactive(data);
}
