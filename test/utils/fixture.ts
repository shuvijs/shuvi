import * as path from 'path';
import { loadConfig, NormalizedConfig } from '@shuvi/service';
import { ShuviConfig } from 'shuvi';
import { resolveConfig } from '@shuvi/service/lib/core/config';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export async function loadFixture(
  fixture: string,
  overrides: ShuviConfig = {}
): Promise<NormalizedConfig> {
  const config = await loadConfig({
    rootDir: resolveFixture(fixture)
  });
  return resolveConfig(config, [overrides]);
}
