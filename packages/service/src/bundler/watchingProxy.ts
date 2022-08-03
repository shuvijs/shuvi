export interface WatchCallback {
  (err?: any): void;
}

export interface Watching {
  // watchings: Watching[];
  // compiler: WebapckMultiCompiler;
  invalidate(callback?: WatchCallback): void;
  suspend(): void;
  resume(): void;
  close(callback?: WatchCallback): void;
}

export interface InvokeRecord {
  name: string;
  args: any[];
}

export class WatchingProxy {
  private _watching: Watching | null = null;

  get watched(): boolean {
    return this._watching !== null;
  }

  set(watching: Watching) {
    if (this._watching) {
      return;
    }

    this._watching = watching;
  }

  invalidate(callback?: WatchCallback) {
    if (this._watching) {
      this._invalidate(callback);
    }
  }

  suspend() {
    if (this._watching) {
      this._suspend();
    }
  }

  resume() {
    if (this._watching) {
      this._resume();
    }
  }

  close(callback: WatchCallback) {
    if (this._watching) {
      this._close(callback);
    }
  }

  private _invalidate(cb?: WatchCallback) {
    this._watching!.invalidate(cb);
  }

  private _suspend() {
    this._watching!.suspend();
  }

  private _resume() {
    this._watching!.resume();
  }

  private _close(cb?: WatchCallback) {
    this._watching!.close(cb);
  }
}
