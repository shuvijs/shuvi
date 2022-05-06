import { IPlatform } from '@shuvi/service';

const platform: IPlatform = ({ target = 'bmp' } = {}, platformContext) => {
  const PlatformConstructor = require(`./targets/${target}`).default;
  //@ts-ignore
  const runtime = new PlatformConstructor();
  return runtime.getPlatformContent(platformContext);
};

export default platform;
