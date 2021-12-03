import { IPlatform } from '../types/index';

export default function (platform: string | undefined): IPlatform {
  const platformName = `@shuvi/platform-${platform}`;
  const platformInstance: IPlatform = require(platformName).default;
  return platformInstance;
}
