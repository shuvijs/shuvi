import path from "path";
import { CONFIG_FILE } from "../constants";
import { AppConfig } from "@shuvi/core";

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
  const config = await loadConfigFromFile<Partial<AppConfig>>(CONFIG_FILE);

  return {
    ...defaultConfig,
    ...config
  };
}
