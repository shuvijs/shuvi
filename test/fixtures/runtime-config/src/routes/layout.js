import { RouterView, getRuntimeConfig } from '@shuvi/runtime';

const isServer = typeof window === 'undefined';
const runtimeConfig = getRuntimeConfig();

const GlobalLayout = () => (
  <div>
    <div id="app">{isServer ? null : runtimeConfig.a}</div>
    <RouterView />
  </div>
);

export default GlobalLayout;
