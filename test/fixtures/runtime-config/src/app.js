import getRuntimeConfig from '@shuvi/app/services/getRuntimeConfig';
import App from '@shuvi/app/services/app';

const isServer = typeof window === 'undefined';
const runtimeConfig = getRuntimeConfig();

const MyApp = () => (
  <div>
    <div id="app">{isServer ? null : runtimeConfig.a}</div>
    <App />
  </div>
);

export default MyApp;
