import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default createPlugin({
  addRuntimeService: () => [
    {
      source: require.resolve('@shuvi/redox'),
      exported: '{ defineModel, redox }',
      filepath: 'model.js'
    },
    {
      source: require.resolve('@shuvi/redox-react'),
      exported: '*',
      // exported: '{ Provider, useModel, createContainer, useStaticModel, useLocalModel, ISelector }',
      filepath: 'model.js'
    }
  ]
}) as CorePluginInstance;
