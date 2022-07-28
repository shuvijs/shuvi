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
import type ws from 'ws';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import { IRouteMatch } from '@shuvi/router';

import {
  MAX_INACTIVE_AGE_MS,
  DEFAULT_TIMEOUT_MS
} from '@shuvi/toolpack/lib/constants';

type modulePath = string;
type lastActivity = number;

const modulesActivity = new Map<modulePath, lastActivity>();
interface IWebpackHotMiddlewareOptions {
  compiler: webpack.Compiler;
  path: string;
}

export class WebpackHotMiddleware {
  _path: string;
  clientManager: ClientManager;
  latestStats: webpack.Stats | null;
  closed: boolean;
  protected timer: NodeJS.Timer = setInterval(() => {
    this.handleInactiveModule();
  }, DEFAULT_TIMEOUT_MS + 1000);

  constructor({ compiler, path }: IWebpackHotMiddlewareOptions) {
    this.clientManager = new ClientManager();
    this.latestStats = null;
    this.closed = false;
    this._path = path;

    compiler.hooks.invalid.tap('webpack-hot-middleware', this.onInvalid);
    compiler.hooks.done.tap('webpack-hot-middleware', this.onDone);
  }

  onInvalid = () => {
    if (this.closed) return;
    this.latestStats = null;
    this.clientManager.publish({ action: 'building' });
  };
  onDone = (statsResult: webpack.Stats) => {
    if (this.closed) return;
    // Keep hold of latest stats so they can be propagated to new clients
    this.latestStats = statsResult;
    this.publishStats('built', this.latestStats);
  };
  onHMR = (client: ws) => {
    if (this.closed) return;
    this.clientManager.add(client);

    if (this.latestStats) {
      this.publishStats('sync', this.latestStats);
    }

    client.addEventListener('message', ({ data }) => {
      try {
        const parsedData = JSON.parse(
          typeof data !== 'string' ? data.toString() : data
        );
        if (parsedData.event === 'ping') {
          this.handlePing(parsedData.page);
          client.send(
            JSON.stringify({
              event: 'pong'
            })
          );
        }
      } catch (_) {}
    });
  };

  publishStats = (action: string, statsResult: webpack.Stats) => {
    const stats = statsResult.toJson({
      all: false,
      hash: true,
      warnings: true,
      errors: true
    });

    this.clientManager.publish({
      action: action,
      hash: stats.hash,
      warnings: stats.warnings || [],
      errors: stats.errors || []
    });
  };

  publish = (payload: any) => {
    if (this.closed) return;
    this.clientManager.publish(payload);
  };

  close = () => {
    if (this.closed) return;
    // Can't remove compiler plugins, so we just set a flag and noop if closed
    // https://github.com/webpack/tapable/issues/32#issuecomment-350644466
    this.closed = true;
    this.clientManager.close();
  };

  private handlePing(page: IRouteMatch[] | null): void {
    if (!page) return; //error page
    for (const { route } of page) {
      modulesActivity.set(route.__componentSourceWithAffix__!, Date.now());
    }
  }

  private handleInactiveModule(): void {
    for (const [id, lastActivity] of modulesActivity) {
      if (lastActivity && Date.now() - lastActivity > MAX_INACTIVE_AGE_MS) {
        ModuleReplacePlugin.replaceModule(id);
        modulesActivity.delete(id);
      }
    }
  }
}

class ClientManager {
  clients: Set<ws>;
  constructor() {
    this.clients = new Set();
  }

  close() {
    this._everyClient(client => {
      client.close();
    });
    this.clients.clear();
  }

  add(client: ws) {
    this.clients.add(client);
    client.addEventListener('close', () => {
      this.clients.delete(client);
    });
  }

  publish(payload: any) {
    this._everyClient(client => {
      client.send(JSON.stringify(payload));
    });
  }

  private _everyClient(fn: (client: ws) => void) {
    for (const client of this.clients) {
      fn(client);
    }
  }
}
