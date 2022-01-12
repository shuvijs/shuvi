import { getRuntimeConfig } from '@shuvi/runtime';
import { dynamic } from '@shuvi/runtime';

export default dynamic(
  () =>
    Promise.resolve(() => <div id="client-a">{getRuntimeConfig().a}</div>),
  {
    ssr: false
  }
);
