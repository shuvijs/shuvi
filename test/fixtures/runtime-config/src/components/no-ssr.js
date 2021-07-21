import getRuntimeConfig from '@shuvi/app/services/getRuntimeConfig';
import dynamic from '@shuvi/app/services/dynamic';

export default dynamic(
  () => Promise.resolve(() => <div id="client-a">{getRuntimeConfig().a}</div>),
  {
    ssr: false
  }
);
