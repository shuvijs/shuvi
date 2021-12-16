import path from 'path';
import { IConfig } from '../../api';
import { loadConfig } from '../index';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(
  name: string,
  userConfig: IConfig = {},
  configFile?: string
) {
  return loadConfig({
    rootDir: resolveFixture(name),
    overrides: userConfig,
    configFile
  });
}
