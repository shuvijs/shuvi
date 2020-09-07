type Handler = (...evts: any[]) => void;

export type EventEmitter<F extends Function = Handler> = {
  on(type: string, handler: F): void;
  off(type: string, handler: F): void;
  emit(type: string, ...evts: any[]): void;
};

export default function emitter<F extends Function = Handler>(): EventEmitter<
  F
> {
  const all: { [s: string]: F[] } = Object.create(null);

  return {
    on(type: string, handler: F) {
      (all[type] || (all[type] = [])).push(handler);
    },

    off(type: string, handler: F) {
      if (all[type]) {
        const index = all[type].indexOf(handler);
        if (index >= 0) {
          all[type].splice(index, 1);
        }
      }
    },

    emit(type: string, ...evts: any[]) {
      (all[type] || []).slice().forEach((handler: F) => {
        handler(...evts);
      });
    }
  };
}
