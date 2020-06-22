import path from 'path';
import { CONFIG_FILE } from '@shuvi/shared/lib/constants';
import { IConfig } from '..';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(name: string, userConfig?: IConfig) {
  const { loadConfig } = require('../index');
  return loadConfig(path.join(resolveFixture(name), CONFIG_FILE), userConfig);
}
