import { createCliPlugin } from '@shuvi/service';

export default createCliPlugin({
  runtimePlugin: () => require.resolve('./runtimePlugin'),
  serverPlugin: () => require.resolve('./serverPlugin'),
  appService: () => [
    {
      source: '@shuvi/plugins/esm/state',
      exported: '*',
      filepath: 'store.js'
    },
    {
      source: '@shuvi/plugins/esm/state',
      exported: '*',
      filepath: 'store.d.ts'
    }
  ]
});
