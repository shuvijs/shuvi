import { getRuntimeConfig } from '@shuvi/app';
import { App } from '@shuvi/app';

const isServer = typeof window === 'undefined';
const runtimeConfig = getRuntimeConfig();

const MyApp = () => (
  <div>
    <div id="app">{isServer ? null : runtimeConfig.client}</div>
    <App />
  </div>
);

export default MyApp;
