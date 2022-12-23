import * as path from 'path';
import { deepmerge } from '@shuvi/utils/deepmerge';
import { ShuviConfig } from '../../core';
import { loadConfig } from '../config';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(
  name: string,
  userConfig: ShuviConfig = {},
  configFile?: string
) {
  const config = await loadConfig({
    rootDir: resolveFixture(name),
    filepath: configFile,
    forceReloadEnv: true
  });
  return deepmerge(config, userConfig);
}
