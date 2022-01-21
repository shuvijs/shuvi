import { createPlugin } from '@shuvi/service';

export default createPlugin({
  runtimePlugin: () => require.resolve('./runtimePlugin'),
  serverPlugin: () => require.resolve('./serverPlugin'),
  runtimeService: () => [
    {
      source: require.resolve('@shuvi/redox-react'),
      exported: '*',
      filepath: 'model.js'
    }
  ]
});
