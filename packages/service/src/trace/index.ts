// This package 'trace' is a modified version of the Next.js that can be found here:
// https://github.com/vercel/next.js/tree/canary/packages/next/src/trace

import type { SpanId, Reporter } from '@shuvi/shared/reporter';

export enum SpanStatus {
  Started,
  Stopped
}

export interface ISpanContext {
  [x: string]: any;
}

const isServer = typeof window === 'undefined';
const KEY_SERVER_REPORTER = Symbol.for('shuvi_server_reporter');

let count = 0;
const getId = () => {
  count++;
  return count;
};

let globalReporter: Reporter | undefined = undefined;

export function setReporter(reporter: Reporter) {
  if (isServer) {
    if ((globalThis as any)[KEY_SERVER_REPORTER]) {
      throw new Error('Reporter already set !');
    }
    (globalThis as any)[KEY_SERVER_REPORTER] = reporter;
    return;
  }
  if (globalReporter) {
    throw new Error('Reporter already set !');
  }
  globalReporter = reporter;
}

export class Span<C extends ISpanContext = ISpanContext> {
  private _name: string;
  private _id: SpanId;
  private _parentId?: SpanId;
  private _attrs: { [key: string]: any };
  private _context: C;
  private _status: SpanStatus;
  private _now: number;
  private _start: number;

  constructor({
    name,
    parentId,
    startTime,
    attrs,
    context
  }: {
    name: string;
    parentId?: SpanId;
    startTime?: number;
    attrs?: Record<string, any>;
    context?: C;
  }) {
    this._name = name;
    this._parentId = parentId;
    this._attrs = attrs ? { ...attrs } : {};
    this._context = (context ? { ...context } : {}) as C;
    this._status = SpanStatus.Started;
    this._id = getId();
    const now = Date.now();
    this._start = startTime || now;
    // Capturing current datetime as additional metadata for external reconstruction.
    this._now = now;
  }

  get status() {
    return this._status;
  }

  get context() {
    return this._context;
  }

  // Durations are reported as microseconds.
  // of something like Date.now(), which reports in milliseconds.
  // Additionally, ~285 years can be safely represented as microseconds as
  // a float64 in both JSON and JavaScript.
  stop(stopTime?: number) {
    const reporter = isServer
      ? (globalThis as any)[KEY_SERVER_REPORTER]
      : globalReporter;
    if (!reporter) {
      return;
    }
    const end: number = stopTime || Date.now();
    const duration = end - this._start;
    this._status = SpanStatus.Stopped;
    if (duration > Number.MAX_SAFE_INTEGER) {
      console.warn(`Duration is too long to express as float64: ${duration}`);
    }
    reporter({
      timestamp: this._now,
      name: this._name,
      duration,
      startTime: this._start,
      endTime: end,
      id: this._id,
      parentId: this._parentId,
      attrs: this._attrs,
      context: this._context
    });
  }

  traceChild(name: string, attrs?: Object) {
    return new Span({
      name,
      parentId: this._id,
      attrs,
      context: this._context
    });
  }

  manualTraceChild(
    name: string,
    startTime: number,
    stopTime: number,
    attrs?: Object
  ) {
    const span = new Span({
      name,
      parentId: this._id,
      attrs,
      startTime,
      context: this._context
    });
    span.stop(stopTime);
  }

  setAttribute(key: string, value: any) {
    this._attrs[key] = String(value);
  }

  setAttributes(attrs: Record<string, any>) {
    Object.keys(attrs).forEach(key => {
      this.setAttribute(key, attrs[key]);
    });
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

export const trace = <C extends ISpanContext = ISpanContext>(
  name: string,
  parentId?: SpanId,
  attrs?: { [key: string]: string },
  context?: C
) => {
  return new Span({ name, parentId, attrs, context });
};
