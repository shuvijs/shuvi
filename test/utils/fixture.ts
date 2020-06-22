import path from 'path';
import { IApiConfig } from '@shuvi/types';
import { IConfig } from 'shuvi/src';
import { build } from './build';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export function loadFixture(fixture: string, overrides: IConfig = {}): IConfig {
  const rootDir = resolveFixture(fixture);
  return { ...overrides, rootDir };
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IApiConfig> = {}
) {
  const config = await loadFixture(fixture, overrides);
  await build({ config });
}
