import { getRuntimeConfig } from '@shuvi/app';
import { dynamic } from '@shuvi/app';

export default dynamic(
  () =>
    Promise.resolve(() => <div id="client">{getRuntimeConfig().client}</div>),
  {
    ssr: false
  }
);
