import path from 'path';
import { getConfigByRootDir } from '@shuvi/service/lib/config';
import getPlatform from 'shuvi/lib/cli/lib/getPlatform';
import { build } from './build';
import { IApiConfig, IConfig } from '@shuvi/service';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export function loadFixture(
  fixture: string,
  overrides: IConfig = {}
): IApiConfig {
  return getConfigByRootDir({
    rootDir: resolveFixture(fixture),
    overrides
  });
}

export async function buildFixture(fixture: string, overrides: IConfig = {}) {
  const config = loadFixture(fixture, overrides);
  const platform = getPlatform(config.platform.name);
  await build({ config, platform });
}
