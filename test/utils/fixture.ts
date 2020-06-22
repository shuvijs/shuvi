import path from 'path';
import { IApiConfig } from '@shuvi/types';
import { build } from './build';
import { CONFIG_FILE } from 'shuvi/src/constants';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}

export function loadFixture(
  fixture: string
): { rootDir: string; configFile: string } {
  const rootDir = resolveFixture(fixture);
  const configFile = path.join(rootDir, CONFIG_FILE);
  return { rootDir, configFile };
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IApiConfig> = {}
) {
  const { rootDir, configFile } = await loadFixture(fixture);
  await build({
    config: {
      ...overrides,
      rootDir
    },
    configFile
  });
}
