import { IConfig } from "@shuvi/types";
import { deepmerge } from "@shuvi/utils/lib/deepmerge";
import path from "path";
import { CONFIG_FILE, ASSET_PREFIX } from "../constants";

const defaultConfig: IConfig = {
  ssr: false,
  env: {},
  rootDir: process.cwd(),
  outputPath: "dist",
  assetPrefix: ASSET_PREFIX,
  router: {
    history: "auto"
  }
};

async function loadConfigFromFile<T>(configPath: string): Promise<T> {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(configPath);
  let config = {} as T;

  try {
    config = require(absolutePath);
    config = (config as any).default || config;
  } catch (err) {
    // Ignore MODULE_NOT_FOUND
    if (err.code !== "MODULE_NOT_FOUND") {
      throw err;
    }
  }

  return config;
}

export async function loadConfig(
  dir: string = process.cwd()
): Promise<IConfig> {
  const config = await loadConfigFromFile<Partial<IConfig>>(
    path.join(dir, CONFIG_FILE)
  );

  config.rootDir = dir;

  return deepmerge(defaultConfig, config);
}
