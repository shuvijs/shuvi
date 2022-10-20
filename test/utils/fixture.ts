import * as path from 'path';
import { loadConfig, ShuviConfig } from 'shuvi';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: ShuviConfig = {}
): Promise<ShuviConfig> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture),
    forceReloadEnv: true
  });
  console.log('loadFixture', deepmerge(config, overrides));
  return deepmerge(config, overrides);
}
