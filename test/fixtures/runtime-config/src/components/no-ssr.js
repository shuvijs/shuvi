import getRuntimeConfig from '@shuvi/services/getRuntimeConfig';
import { dynamic } from '@shuvi/services';

export default dynamic(
  () => Promise.resolve(() => <div id="client-a">{getRuntimeConfig().a}</div>),
  {
    ssr: false
  }
);
