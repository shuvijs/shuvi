import path from 'path';
import { Runtime } from '../types';

export default function (platform: string | undefined) {
  const platformName = `@shuvi/platform-${platform}`;
  const runtime: Runtime.IRuntime = require(platformName).default;
  const runtimeDir = path.dirname(
    require.resolve(`${platformName}/package.json`)
  );
  return {
    runtime,
    runtimeDir
  };
}
