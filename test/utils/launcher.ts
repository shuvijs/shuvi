import qs from 'querystring';
import { IApiConfig } from '@shuvi/types';
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

async function createTestContext(app: Shuvi) {
  const port = await findPort();
  await app.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string, query?: Record<string, any>) => {
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
    }
  };
}

export async function launchFixture(
  name: string,
  overrides: Partial<IApiConfig> = {}
): Promise<AppCtx> {
  const { rootDir, configFile } = loadFixture(name);
  const shuviApp = shuvi({
    dev: true,
    config: {
      ...overrides,
      rootDir
    },
    configFile
  });
  return await createTestContext(shuviApp);
}

export async function serveFixture(
  name: string,
  overrides: Partial<IApiConfig> = {}
): Promise<AppCtx> {
  const { rootDir, configFile } = loadFixture(name);
  const config = {
    ...overrides,
    rootDir
  };
  await build({
    config,
    configFile
  });
  const shuviApp = shuvi({ dev: false, config, configFile });
  return createTestContext(shuviApp);
}
