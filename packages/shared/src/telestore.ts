/// <reference lib="dom" />
export type Store = Record<string, any>;

const hasOwnProperty = Object.prototype.hasOwnProperty;

const isServer = typeof window === 'undefined';

// set on server, get from client
export class Telestore {
  private _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    if (isServer) {
      return defaultValue;
    }

    if (!hasOwnProperty.call(this._store, key)) {
      return defaultValue;
    }

    return this._store[key];
  }

  set(key: string, value: any) {
    if (!isServer) {
      return;
    }

    this._store[key] = value;
  }

  dump() {
    return this._store;
  }
}
