import { DEFAULT_ERROR_MESSAGE } from '@shuvi/shared/lib/constants';

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

export interface Response {
  readonly $$type: 'Response';
  readonly body: any;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
}

class ResponseImpl implements Response {
  public $$type = 'Response' as const;
  public body: string | Record<string, any>;
  public status: number;
  public statusText: string;
  public headers: Headers;

  constructor(data: string, options: ResponseOptions = {}) {
    this.body = data;
    this.status = options.status || 200;
    this.statusText = options.statusText || '';
    this.headers = new Headers(options.headers);
  }
}

export function isResponse(resp: any): resp is Response {
  return resp && resp.$$type === 'Response';
}

export function isRedirect(resp: Response): boolean {
  return resp.status >= 300 && resp.status < 400;
}

export function isError(resp: Response): boolean {
  return resp.status !== 200;
}

export function json(data: any): Response {
  return new ResponseImpl(data, {
    status: 200,
    statusText: 'OK'
  });
}

export function text(
  body: string,
  { status = 200 }: { status?: number } = {}
): Response {
  return new ResponseImpl(body, {
    status,
    statusText: 'OK'
  });
}

export function redirect(to: string, status: number = 302): Response {
  return new ResponseImpl('', {
    status,
    headers: {
      Location: to
    }
  });
}

export function error({
  statusCode = 500,
  message
}: {
  statusCode?: number;
  message?: string;
}): Response {
  // todo: status should not equals to 200

  let msg =
    message !== undefined
      ? message
      : (DEFAULT_ERROR_MESSAGE as any)[statusCode];

  return new ResponseImpl(msg || '', {
    status: statusCode
  });
}
