import path from 'path';
import { CONFIG_FILE } from '@shuvi/shared/lib/constants';
import { IConfig } from '..';
import { loadConfig } from '../index';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(
  name: string,
  userConfig?: IConfig,
  configFile: boolean = true
) {
  if (userConfig) {
    userConfig.rootDir = resolveFixture(name);
  }
  return loadConfig(
    configFile ? path.join(resolveFixture(name), CONFIG_FILE) : undefined,
    userConfig
  );
}
