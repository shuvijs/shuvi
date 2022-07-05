import * as path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig, Config } from '@shuvi/service';
import { createDefaultConfig } from '@shuvi/service/lib/core/config';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: Config = {}
): Promise<Required<Config>> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture)
  });
  return deepmerge(createDefaultConfig(), config, overrides);
}
