import path from 'path';
import { loadConfig } from '@shuvi/service/lib/config';
import { build } from './build';
import { IConfig } from '@shuvi/service';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export function loadFixture(fixture: string, overrides: IConfig = {}): IConfig {
  return loadConfig({
    rootDir: resolveFixture(fixture),
    overrides
  });
}

export async function buildFixture(fixture: string, overrides: IConfig = {}) {
  const config = loadFixture(fixture, overrides);
  await build({ config });
}
