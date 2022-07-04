import { dirname, join } from 'path';
import { createPlugin, CorePluginInstance } from '@shuvi/service';
import server from './server';

const resolveDep = (module: string) => require.resolve(module);

const resolveLib = (module: string) =>
  dirname(resolveDep(join(module, 'package.json')));

export default function getRedoxPlugin() {
  const core = createPlugin({
    addRuntimeService: () => [
      {
        source: resolveLib('@shuvi/redox'),
        exported: '*',
        filepath: 'model.ts'
      },
      {
        source: resolveLib('@shuvi/redox-react'),
        exported: '*',
        filepath: 'model.ts'
      }
    ],
    configWebpack: chain => {
      chain.resolve.alias.set('@shuvi/redox', resolveLib('@shuvi/redox'));
      chain.resolve.alias.set(
        '@shuvi/redox-react',
        resolveLib('@shuvi/redox-react')
      );
      return chain;
    }
  }) as CorePluginInstance;

  const runtimePath = require.resolve(
    join(__dirname, '../../../esm/features/redox/runtime')
  );
  return {
    core,
    runtime: {
      plugin: runtimePath
    },
    server,
    types: join(__dirname, 'types')
  };
}
