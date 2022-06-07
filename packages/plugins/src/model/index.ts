import * as path from 'path';
import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default createPlugin({
  addRuntimeService: () => [
    {
      source: path.dirname(require.resolve('@shuvi/redox/package.json')),
      exported: '{ defineModel, redox }',
      filepath: 'model.js'
    },
    {
      source: path.dirname(require.resolve('@shuvi/redox-react/package.json')),
      exported: '*',
      filepath: 'model.js'
    }
  ]
}) as CorePluginInstance;
