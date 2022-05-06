// https://github.com/vercel/next.js/commit/c5cc6072d04f63412dd4451c808b7705bbcda9e5
// Based on https://github.com/webpack-contrib/webpack-hot-middleware/blob/9708d781ae0e46179cf8ea1a94719de4679aaf53/middleware.js
// Included License below

// Copyright JS Foundation and other contributors

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
import type webpack from '@shuvi/toolpack/lib/webpack';
import { IRequestHandlerWithNext, IResponse } from '../../http-server';

interface IWebpackHotMiddlewareOptions {
  compiler: webpack.Compiler;
  path: string;
}

export class WebpackHotMiddleware {
  _path: string;
  eventStream: EventStream;
  latestStats: webpack.Stats | null;
  closed: boolean;

  constructor({ compiler, path }: IWebpackHotMiddlewareOptions) {
    this.eventStream = new EventStream();
    this.latestStats = null;
    this.closed = false;
    this._path = path;

    compiler.hooks.invalid.tap('webpack-hot-middleware', this.onInvalid);
    compiler.hooks.done.tap('webpack-hot-middleware', this.onDone);
  }

  onInvalid = () => {
    if (this.closed) return;
    this.latestStats = null;
    this.eventStream.publish({ action: 'building' });
  };
  onDone = (statsResult: webpack.Stats) => {
    if (this.closed) return;
    // Keep hold of latest stats so they can be propagated to new clients
    this.latestStats = statsResult;
    this.publishStats('built', this.latestStats);
  };
  middleware: IRequestHandlerWithNext = (req, res, next) => {
    if (this.closed) return next();
    if (!req.url?.startsWith(this._path)) return next();
    this.eventStream.handler(req, res, next);
    if (this.latestStats) {
      // Explicitly not passing in `log` fn as we don't want to log again on
      // the server
      this.publishStats('sync', this.latestStats);
    }
  };

  publishStats = (action: string, statsResult: webpack.Stats) => {
    const stats = statsResult.toJson({
      all: false,
      hash: true,
      warnings: true,
      errors: true
    });

    this.eventStream.publish({
      action: action,
      hash: stats.hash,
      warnings: stats.warnings || [],
      errors: stats.errors || []
    });
  };

  publish = (payload: any) => {
    if (this.closed) return;
    this.eventStream.publish(payload);
  };
  close = () => {
    if (this.closed) return;
    // Can't remove compiler plugins, so we just set a flag and noop if closed
    // https://github.com/webpack/tapable/issues/32#issuecomment-350644466
    this.closed = true;
    this.eventStream.close();
  };
}

class EventStream {
  clients: Set<IResponse>;
  interval: NodeJS.Timeout;
  constructor() {
    this.clients = new Set();

    this.interval = setInterval(this.heartbeatTick, 2500).unref();
  }

  heartbeatTick = () => {
    this.everyClient(client => {
      client.write('data: \uD83D\uDC93\n\n');
    });
  };

  everyClient(fn: (client: IResponse) => void) {
    for (const client of this.clients) {
      fn(client);
    }
  }

  close() {
    clearInterval(this.interval);
    this.everyClient(client => {
      if (!client.finished || !client.writableEnded) client.end();
    });
    this.clients.clear();
  }

  handler: IRequestHandlerWithNext = (req, res, next) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream;charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      // While behind nginx, event stream should not be buffered:
      // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
      'X-Accel-Buffering': 'no'
    };

    const isHttp1 = !(parseInt(req.httpVersion) >= 2);
    if (isHttp1) {
      req.socket.setKeepAlive(true);
      Object.assign(headers, {
        Connection: 'keep-alive'
      });
    }

    res.writeHead(200, headers);
    res.write('\n');
    this.clients.add(res);
    req.on('close', () => {
      if (!res.finished || !res.writableEnded) res.end();
      this.clients.delete(res);
    });
  };

  publish(payload: any) {
    this.everyClient(client => {
      client.write('data: ' + JSON.stringify(payload) + '\n\n');
    });
  }
}
