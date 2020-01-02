import path from "path";
import { ApplicationConfig, constants } from "@shuvi/core";

interface LoadConfigOption<T> {
  overrides?: T;
}

export async function loadConfigFromFile<T>(
  configPath: string,
  options: LoadConfigOption<T> = {}
): Promise<T> {
  const { overrides } = options;
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(configPath);
  const config: T = require(absolutePath);

  if (overrides) {
    return {
      ...config,
      ...overrides
    };
  }

  return config;
}

export async function loadConfig() {
  return await loadConfigFromFile<Partial<ApplicationConfig>>(constants.CONFIG_FILE);
}
