import path from 'path';
import { UserConfig } from '../../apiTypes';
import { loadConfig, resolveConfig, getFullUserConfig } from '../config';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export async function loadFixture(
  name: string,
  userConfig: UserConfig = {},
  configFile?: string
) {
  const config = await loadConfig({
    rootDir: resolveFixture(name),
    filepath: configFile
  });
  return resolveConfig(getFullUserConfig(config), [userConfig]);
}
