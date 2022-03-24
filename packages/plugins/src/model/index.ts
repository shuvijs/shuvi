import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default createPlugin({
  addRuntimeService: () => [
    {
      source: require.resolve('@shuvi/redox-react'),
      exported: '*',
      filepath: 'model.js'
    }
  ]
}) as CorePluginInstance;
