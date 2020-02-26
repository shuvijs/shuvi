import { RouterHistoryMode } from "@shuvi/types";
import path from "path";
import { CONFIG_FILE } from "../constants";

export interface AppConfig {
  ssr: boolean;
  cwd: string;
  outputPath: string;
  publicUrl: string;
  router: {
    history: RouterHistoryMode;
  };
}

function deepMerge(...args: any[]) {
  function mergeTwoObject(origin: any, target: any) {
    if (target === null || typeof target === "undefined") {
      return origin;
    }

    Object.keys(target).forEach(key => {
      const originValue = origin[key];
      const targetValye = target[key];
      if (typeof originValue === "object" && typeof targetValye === "object") {
        origin[key] = deepMerge(originValue, targetValye);
      } else if (typeof targetValye === "object") {
        origin[key] = deepMerge({}, targetValye);
      } else {
        origin[key] = targetValye;
      }
    });
    return origin;
  }

  return args.reduce(mergeTwoObject, {});
}

const defaultConfig: AppConfig = {
  ssr: false,
  cwd: process.cwd(),
  outputPath: "dist",
  publicUrl: "/",
  router: {
    history: "auto"
  }
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
  return deepMerge(defaultConfig, config);
}
