import path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig } from '@shuvi/service';
import { build } from './build';
import { UserConfig } from '@shuvi/service';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: UserConfig = {}
): Promise<UserConfig> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture)
  });
  return deepmerge(config, overrides);
}

export async function buildFixture(
  fixture: string,
  overrides: UserConfig = {}
) {
  const config = await loadFixture(fixture, overrides);
  await build({ config });
}
