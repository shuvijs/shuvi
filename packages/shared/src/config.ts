import path from "path";

interface LoadConfigOption<T> {
  overrides?: T;
}

export async function loadConfig<T>(
  configPath: string,
  options: LoadConfigOption<T> = {}
): Promise<T> {
  const { overrides } = options;
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.join(configPath);
  const config: T = require(absolutePath);

  if (overrides) {
    return {
      ...config,
      ...overrides
    };
  }

  return config;
}
