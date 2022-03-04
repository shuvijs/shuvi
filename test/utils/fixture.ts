import path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig, UserConfig } from '@shuvi/service';
import { createDefaultConfig } from '@shuvi/service/lib/core/config';
import { getPlatform } from 'shuvi/lib/utils';
import { build } from './build';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: UserConfig = {}
): Promise<Required<UserConfig>> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture)
  });
  return deepmerge(createDefaultConfig(), config, overrides);
}

export async function buildFixture(
  fixture: string,
  overrides: UserConfig = {}
) {
  const config = await loadFixture(fixture, overrides);
  const platform = getPlatform(config.platform.name);
  await build({ config, cwd: resolveFixture(fixture), platform });
}
