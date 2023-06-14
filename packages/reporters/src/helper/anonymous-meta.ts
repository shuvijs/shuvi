import isDockerFunction from 'is-docker';
import isWslBoolean from 'is-wsl';
import os from 'os';
import { execSync } from 'child_process';

import * as ciEnvironment from 'ci-info';

type PackageManager = {
  packageManager: 'npm' | 'pnpm' | 'yarn';
  packageManagerVersion: string | undefined;
};

type AnonymousMeta = {
  systemPlatform: NodeJS.Platform;
  systemRelease: string;
  systemArchitecture: string;
  cpuCount: number;
  cpuModel: string | null;
  cpuSpeed: number | null;
  memoryInMb: number;
  isDocker: boolean;
  isWsl: boolean;
  isCI: boolean;
  ciName: string | null;
  packageManager: string;
  packageManagerVersion: string | undefined;
  nodeVersion: string;
  shuviVersion?: string;
};

let traits: AnonymousMeta | undefined;

export function getAnonymousMeta(): AnonymousMeta {
  if (traits) {
    return traits;
  }

  const cpus = os.cpus() || [];

  const { packageManager, packageManagerVersion } = getPkgManager();

  traits = {
    // Software information
    systemPlatform: os.platform(),
    systemRelease: os.release(),
    systemArchitecture: os.arch(),
    // Machine information
    cpuCount: cpus.length,
    cpuModel: cpus.length ? cpus[0].model : null,
    cpuSpeed: cpus.length ? cpus[0].speed : null,
    memoryInMb: Math.trunc(os.totalmem() / Math.pow(1024, 2)),
    // Environment information
    isDocker: isDockerFunction(),
    isWsl: isWslBoolean,
    isCI: ciEnvironment.isCI,
    ciName: (ciEnvironment.isCI && ciEnvironment.name) || null,
    packageManager,
    packageManagerVersion,
    nodeVersion: process.version
  };

  return traits;
}

export function getPkgManager(): PackageManager {
  try {
    const userAgent = process.env.npm_config_user_agent;
    if (userAgent) {
      const packageManagerVersion = userAgent.split(' ')[0].split('/')[1];
      if (userAgent.startsWith('yarn')) {
        return { packageManager: 'yarn', packageManagerVersion };
      } else if (userAgent.startsWith('pnpm')) {
        return { packageManager: 'pnpm', packageManagerVersion };
      }
    }

    try {
      const packageManagerVersion = execSync(`yarn --version`)
        .toString()
        .trim();
      return { packageManager: 'yarn', packageManagerVersion };
    } catch {
      const packageManagerVersion = execSync(`pnpm --version`)
        .toString()
        .trim();
      return { packageManager: 'pnpm', packageManagerVersion };
    }
  } catch {
    try {
      const packageManagerVersion = execSync(`npm --version`).toString().trim();
      return { packageManager: 'npm', packageManagerVersion };
    } catch {
      return { packageManager: 'npm', packageManagerVersion: undefined };
    }
  }
}
