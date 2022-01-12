import { getRuntimeConfig } from '@shuvi/runtime';

const isServer = typeof window === 'undefined';
const runtimeConfig = getRuntimeConfig();

const getApp = App => () =>
  (
    <div>
      <div id="app">{isServer ? null : runtimeConfig.a}</div>
      <App />
    </div>
  );

export default getApp;
