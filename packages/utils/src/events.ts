type AnyHandler = (...args: any) => void;

export type RemoveListenerCallback = () => void | undefined;

export type Event<F extends AnyHandler> = {
  toArray: () => F[];
  length: number;
  on: (fn: F) => RemoveListenerCallback;
  emit: (...arg: Parameters<F>) => void;
};

export interface EventMap {
  [key: string]: AnyHandler;
}

export type Events<EM extends EventMap = EventMap> = {
  on<Name extends keyof EM, Handler = EM[Name]>(
    type: Name,
    handler: Handler
  ): RemoveListenerCallback;
  emit<Name extends keyof EM, Handler extends AnyHandler = EM[Name]>(
    type: string,
    ...args: Parameters<Handler>
  ): void;
};

export function createEvent<F extends AnyHandler>(): Event<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    toArray(): F[] {
      return handlers;
    },
    on(fn: F) {
      handlers.push(fn);
      return function () {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    emit(...arg: Parameters<F>) {
      // @ts-ignore
      handlers.forEach(fn => fn && fn(...arg));
    }
  };
}

export function createEvents<EM extends EventMap = EventMap>(): Events<EM> {
  const all: { [K in keyof EM]: any[] } = Object.create(null);

  return {
    on<Name extends keyof EM, Handler = EM[Name]>(
      type: Name,
      handler: Handler
    ): RemoveListenerCallback {
      (all[type] || (all[type] = [])).push(handler);

      return () => {
        const index = all[type].indexOf(handler);
        if (index > -1) {
          all[type].splice(index, 1);
        }
      };
    },

    emit<Name extends keyof EM, Handler extends AnyHandler = EM[Name]>(
      type: string,
      ...args: Parameters<Handler>
    ) {
      (all[type] || []).slice().forEach(handler => {
        // @ts-ignore
        handler(...args);
      });
    }
  };
}
