import * as path from 'path';
import { Config } from '../../apiTypes';
import { loadConfig, resolveConfig } from '../config';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(
  name: string,
  userConfig: Config = {},
  configFile?: string
) {
  const config = await loadConfig({
    rootDir: resolveFixture(name),
    filepath: configFile
  });
  return resolveConfig(config, [userConfig]);
}
