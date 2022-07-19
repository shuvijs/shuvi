import * as path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadConfig, Config, NormalizedConfig } from '@shuvi/service';
import {
  createDefaultConfig,
  resolveConfig
} from '@shuvi/service/lib/core/config';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: Config = {}
): Promise<Required<NormalizedConfig>> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture)
  });
  return resolveConfig(deepmerge(createDefaultConfig(), config, overrides));
}
