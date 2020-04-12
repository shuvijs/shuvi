import qs from 'querystring';
import { IConfig } from '@shuvi/types';
import { shuvi, Shuvi } from 'shuvi';
import { loadFixture } from './fixture';
import { build } from './build';
import { findPort } from './findPort';
import Browser from './browser';

export { Shuvi };

export interface AppCtx {
  shuvi: Shuvi;
  browser: Browser;
  url: (x: string, query?: Record<string, any>) => string;
  close(): Promise<void>;
}

async function createTextContext(app: Shuvi) {
  const port = await findPort();
  await app.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string, query: Record<string, any> = {}) => {
    const path = 'http://localhost:' + port + route;
    if (query) {
      return path + '?' + qs.stringify(query);
    } else {
      return path;
    }
  };

  return {
    shuvi: app,
    browser,
    url,
    async close() {
      await app.close();
      await browser.close();
    },
  };
}

export async function launchFixture(
  name: string,
  overrides: Partial<IConfig> = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  const shuviApp = shuvi({ dev: true, config });
  return await createTextContext(shuviApp);
}

export async function serveFixture(
  name: string,
  overrides: Partial<IConfig> = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  await build(config);
  const shuviApp = shuvi({ dev: false, config });
  return createTextContext(shuviApp);
}
