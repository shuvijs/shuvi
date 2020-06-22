import path from 'path';
import { loadConfig } from 'shuvi/lib/config';
import { build } from './build';
import { CONFIG_FILE } from 'shuvi/src/constants';
import { IConfig } from 'shuvi/src/shuvi';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: IConfig = {}
): Promise<IConfig> {
  const rootDir = resolveFixture(fixture);
  if (!overrides.rootDir) {
    overrides.rootDir = rootDir
  }
  const config = await loadConfig(path.join(rootDir, CONFIG_FILE), overrides);
  return config;
}

export async function buildFixture(fixture: string, overrides: IConfig = {}) {
  const config = await loadFixture(fixture, overrides);
  await build({ config });
}
