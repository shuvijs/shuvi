import isDockerFunction from 'is-docker';
import isWslBoolean from 'is-wsl';
import os from 'os';

import * as ciEnvironment from 'ci-info';

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
  shuviVersion?: string;
};

let traits: AnonymousMeta | undefined;

export function getAnonymousMeta(version: string): AnonymousMeta {
  if (traits) {
    return traits;
  }

  const cpus = os.cpus() || [];
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
    shuviVersion: version
  };

  return traits;
}
