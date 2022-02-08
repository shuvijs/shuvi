import { createPlugin } from '@shuvi/service';

export default createPlugin({
  addRuntimePlugin: () => require.resolve('./runtimePlugin'),
  addServerPlugin: () => require.resolve('./serverPlugin'),
  addRuntimeService: () => [
    {
      source: require.resolve('@shuvi/redox-react'),
      exported: '*',
      filepath: 'model.js'
    }
  ]
});
