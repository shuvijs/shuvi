import path from "path";
import { constants } from "@shuvi/core";
import { AppConfig } from "@shuvi/types/core";

const defaultConfig: AppConfig = {
  cwd: process.cwd(),
  outputPath: "dist",
  publicUrl: "/"
};

export async function loadConfigFromFile<T>(configPath: string): Promise<T> {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(configPath);
  const config: T = require(absolutePath);
  return config;
}

export async function loadConfig(): Promise<AppConfig> {
  const config = await loadConfigFromFile<Partial<AppConfig>>(
    constants.CONFIG_FILE
  );

  return {
    ...defaultConfig,
    ...config
  };
}
