type HeaderRecord = Record<string, string>;
type HeaderArray = [string, string][];

export interface ResponseOptions {
  status?: number;
  statusText?: string;
  headers?: HeaderRecord;
}

const supportIterator = 'Symbol' in global && 'iterator' in Symbol;

function normalizeName(name: string) {
  if (typeof name !== 'string') {
    name = String(name);
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError(
      'Invalid character in header field name: "' + name + '"'
    );
  }
  return name.toLowerCase();
}

function normalizeValue(value: string) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  return value;
}

// Build a destructive iterator for the value list
function iteratorFor(items: any[]) {
  var iterator = {
    next: function () {
      var value = items.shift();
      return { done: value === undefined, value: value };
    }
  };

  if (supportIterator) {
    (iterator as any)[Symbol.iterator] = function () {
      return iterator;
    };
  }

  return iterator;
}

class Headers {
  private _map: Record<string, string> = {};

  constructor(init?: HeaderRecord | HeaderArray) {
    if (init instanceof Headers) {
      (init as Headers).forEach((value, name) => {
        this.append(name, value);
      });
    } else if (Array.isArray(init)) {
      init.forEach(header => this.append(header[0], header[1]));
    } else if (init) {
      Object.keys(init).forEach(name => {
        this.append(name, init[name]);
      });
    }
  }

  append(name: string, value: string) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this._map[name];
    this._map[name] = oldValue ? oldValue + ', ' + value : value;
  }

  delete(name: string) {
    delete this._map[normalizeName(name)];
  }

  get(name: string) {
    name = normalizeName(name);
    return this.has(name) ? this._map[name] : null;
  }

  has(name: string) {
    return this._map.hasOwnProperty(normalizeName(name));
  }

  set(name: string, value: string) {
    this._map[normalizeName(name)] = normalizeValue(value);
  }

  forEach(
    callback: (value: string, name: string, t: this) => void,
    thisArg?: any
  ) {
    for (var name in Object.keys(this._map)) {
      callback.call(thisArg, this._map[name], name, this);
    }
  }

  keys() {
    const items: string[] = [];
    this.forEach((_value, name) => items.push(name));
    return iteratorFor(items);
  }

  value() {
    const items: string[] = [];
    this.forEach(value => items.push(value));
    return iteratorFor(items);
  }

  entries() {
    const items: [string, string][] = [];
    this.forEach((value, name) => items.push([name, value]));
    return iteratorFor(items);
  }
}

if (supportIterator) {
  (Headers.prototype as any)[Symbol.iterator] = Headers.prototype.entries;
}

export type ResponseType = 'error' | 'json' | 'redirect';

export interface Response {
  readonly data: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
}

class ResponseImpl implements Response {
  public readonly __shuvi_resp_type__: 'error' | 'json' | 'redirect';
  public readonly data: any;
  public readonly status: number;
  public readonly statusText: string;
  public readonly headers: Headers;

  constructor(data: any, type: ResponseType, options: ResponseOptions = {}) {
    this.__shuvi_resp_type__ = type;
    this.data = data;
    this.status = options.status || 200;
    this.statusText = options.statusText || '';
    this.headers = new Headers(options.headers);
  }
}

function createTypeCreator(type: ResponseType) {
  return (obj: any): obj is Response => {
    return obj && obj.__shuvi_resp_type__ === type;
  };
}

export const isResponse = (obj: any): obj is Response =>
  obj && typeof obj.__shuvi_resp_type__ === 'string';

export const isJson = createTypeCreator('json');
export const isRedirect = createTypeCreator('redirect');
export const isError = createTypeCreator('error');

export function json(data: any): Response {
  return new ResponseImpl(data, 'json');
}

export function redirect(to: string, status: number = 302): Response {
  return new ResponseImpl('', 'redirect', {
    status,
    headers: {
      Location: to
    }
  });
}

export function error(): Response;
export function error(body: string): Response;
export function error(body: string, statusCode?: number): Response;
export function error(body?: string, statusCode: number = 500): Response {
  return new ResponseImpl(body, 'error', {
    status: statusCode
  });
}
