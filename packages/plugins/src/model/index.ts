import { createCliPlugin } from '@shuvi/service';

export default createCliPlugin({
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
