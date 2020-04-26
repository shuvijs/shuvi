import path from 'path';
import { IApiConfig } from '@shuvi/types';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig } from 'shuvi/lib/config';
import { build } from './build';

export async function loadFixture(
  fixture: string,
  overrides: Partial<IApiConfig> = {}
): Promise<IApiConfig> {
  const rootDir = path.resolve(__dirname, '..', 'fixtures', fixture);
  const config = await loadConfig(rootDir);

  return deepmerge(config, overrides);
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IApiConfig> = {}
) {
  const config = await loadFixture(fixture, overrides);
  await build(config);
}
