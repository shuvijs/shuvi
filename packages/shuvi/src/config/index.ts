import { RouterHistoryMode } from "@shuvi/types";
import { merge } from "@shuvi/utils/lib/merge";
import path from "path";
import { CONFIG_FILE, ASSET_PREFIX } from "../constants";

export interface ShuviConfig {
  ssr: boolean;
  rootDir: string;
  outputPath: string;
  assetPrefix: string;
  router: {
    history: RouterHistoryMode;
  };
}

const defaultConfig: ShuviConfig = {
  ssr: false,
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
): Promise<ShuviConfig> {
  const config = await loadConfigFromFile<Partial<ShuviConfig>>(
    path.join(dir, CONFIG_FILE)
  );

  config.rootDir = dir;

  return merge(defaultConfig, config);
}
