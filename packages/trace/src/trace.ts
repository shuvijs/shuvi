import { SpanId, reporter } from './shared';

let count = 0;
const getId = () => {
  count++;
  return count;
};

// eslint typescript has a bug with TS enums
/* eslint-disable no-shadow */
export enum SpanStatus {
  Started,
  Stopped
}

export class Span {
  name: string;
  id: SpanId;
  parentId?: SpanId;
  duration: number | null;
  attrs: { [key: string]: any };
  status: SpanStatus;
  now: number;

  _start: number;

  constructor({
    name,
    parentId,
    attrs,
    startTime
  }: {
    name: string;
    parentId?: SpanId;
    startTime?: number;
    attrs?: Object;
  }) {
    this.name = name;
    this.parentId = parentId;
    this.duration = null;
    this.attrs = attrs ? { ...attrs } : {};
    this.status = SpanStatus.Started;
    this.id = getId();
    const now = Date.now();
    this._start = startTime || now;
    // Capturing current datetime as additional metadata for external reconstruction.
    this.now = now;
  }

  // Durations are reported as microseconds.
  // of something like Date.now(), which reports in milliseconds.
  // Additionally, ~285 years can be safely represented as microseconds as
  // a float64 in both JSON and JavaScript.
  stop(stopTime?: number) {
    if (!reporter) {
      return;
    }
    const end: number = stopTime || Date.now();
    const duration = end - this._start;
    this.status = SpanStatus.Stopped;
    if (duration > Number.MAX_SAFE_INTEGER) {
      console.warn(`Duration is too long to express as float64: ${duration}`);
    }
    reporter(
      this.now,
      this.name,
      duration,
      this._start,
      this.id,
      this.parentId,
      this.attrs
    );
  }

  traceChild(name: string, attrs?: Object) {
    return new Span({ name, parentId: this.id, attrs });
  }

  manualTraceChild(
    name: string,
    startTime: number,
    stopTime: number,
    attrs?: Object
  ) {
    const span = new Span({ name, parentId: this.id, attrs, startTime });
    span.stop(stopTime);
  }

  setAttribute(key: string, value: any) {
    this.attrs[key] = String(value);
  }

  traceFn<T>(fn: (span: Span) => T): T {
    try {
      return fn(this);
    } finally {
      this.stop();
    }
  }

  async traceAsyncFn<T>(fn: (span: Span) => T | Promise<T>): Promise<T> {
    try {
      return await fn(this);
    } finally {
      this.stop();
    }
  }
}

export const trace = (
  name: string,
  parentId?: SpanId,
  attrs?: { [key: string]: string }
) => {
  return new Span({ name, parentId, attrs });
};
