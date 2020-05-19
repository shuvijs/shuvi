import { getRuntimeConfig } from '@shuvi/app';
import { dynamic } from '@shuvi/app';

export default dynamic(
  () =>
    Promise.resolve(() => <div id="client-a">{getRuntimeConfig().a}</div>),
  {
    ssr: false
  }
);
