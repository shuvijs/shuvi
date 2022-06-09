import { ReactiveEffect } from '@vue/reactivity';

export type FileLifecycleHooks = 'mounted' | 'unmounted';

export type Data = Record<string, unknown>;

export interface MethodOptions {
  [key: string]: Function;
}

export interface FileInternalOptions {
  // id: string;
}

export interface FileOptionsBase<Data, Method extends MethodOptions>
  extends FileInternalOptions {
  name: string;
  content: (
    this: CreateFilePublicInstance<Data, Method>,
    ctx: any
  ) => Promise<string> | string | null | undefined;

  // state
  // Limitation: we cannot expose RawBindings on the `this` context for data
  // since that leads to some sort of circular inference and breaks ThisType
  // for the entire component.
  setup?: (this: void) => Data | void;
  methods?: Method;

  // lifecycle
  mounted?(): void;
  unmounted?(): void;

  // allow any custom options
  [key: string]: any;
}

export type FileOptions<
  Data = any,
  Method extends MethodOptions = any
> = FileOptionsBase<Data, Method> &
  ThisType<CreateFilePublicInstance<Data, Method>>;

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type FilePublicInstance<
  Data = {}, // return from data()
  Context = {},
  Method extends MethodOptions = {}
> = {
  $setup: Data;
  $context: Context;
} & Data &
  Context &
  Method;

export type CreateFilePublicInstance<
  Data = {},
  Context = {},
  Method extends MethodOptions = {}
> = FilePublicInstance<Data, Context, Method>;

export type FileInternalContentFunction = (ctx: any, $setup: Data) => string;

export type FileType<
  Data = any,
  Method extends MethodOptions = MethodOptions
> = FileOptions<Data, Method>;

export interface FileInternalInstance {
  name: string;

  type: FileType;
  effects?: ReactiveEffect[];

  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update: any;
  destroy: any;
  /**
   * The render function that returns vdom tree.
   */
  content: FileInternalContentFunction;
  /**
   * cache for proxy access type to avoid hasOwnProperty calls
   */
  accessCache: Data | null;

  // the rest are only for stateful components ---------------------------------

  // main proxy that serves as the public instance (`this`)
  proxy: FilePublicInstance | null;

  // state
  /**
   * This is the target for the public instance proxy. It also holds properties
   * injected by user options (computed, methods etc.) and user-attached
   * custom properties (via `this.x = ...`)
   */
  ctx: Data;
  setupState: Data;

  // lifecycle
  isMounted: boolean;
  isUnmounted: boolean;
  mounted: Function[];
  unmounted: Function[];
}
