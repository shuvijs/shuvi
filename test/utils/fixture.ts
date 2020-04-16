import path from 'path';
import { IConfig } from '@shuvi/types';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig } from 'shuvi/lib/config';
import { build } from './build';

export async function loadFixture(
  fixture: string,
  overrides: Partial<IConfig> = {}
): Promise<IConfig> {
  const rootDir = path.resolve(__dirname, '..', 'fixtures', fixture);
  const config = await loadConfig(rootDir);

  return deepmerge(config, overrides);
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IConfig> = {}
) {
  const config = await loadFixture(fixture, overrides);
  await build(config);
}
