import path from 'path';
import { loadConfig } from 'shuvi/lib/config';
import { build } from './build';
import { IConfig } from 'shuvi/src/shuvi';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: IConfig = {}
): Promise<IConfig> {
  return loadConfig({
    rootDir: resolveFixture(fixture),
    overrides
  });
}

export async function buildFixture(fixture: string, overrides: IConfig = {}) {
  const config = await loadFixture(fixture, overrides);
  await build({ config });
}
