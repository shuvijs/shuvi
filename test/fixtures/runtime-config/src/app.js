import { App, getRuntimeConfig } from '@shuvi/runtime';

const isServer = typeof window === 'undefined';
const runtimeConfig = getRuntimeConfig();

const MyApp = () => (
  <div>
    <div id="app">{isServer ? null : runtimeConfig.a}</div>
    <App />
  </div>
);

export default MyApp;
