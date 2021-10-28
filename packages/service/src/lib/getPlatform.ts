import { IRuntime } from '../types/index';

export default function (platform: string | undefined): IRuntime {
  const platformName = `@shuvi/platform-${platform}`;
  const platformInstance: IRuntime = require(platformName).default;
  return platformInstance;
}
