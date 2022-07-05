import { join } from 'path';
import server from './server';

export default function getRedoxPlugin() {
  const runtimePath = require.resolve(
    join(__dirname, '../../../esm/features/redox/runtime')
  );
  return {
    runtime: {
      plugin: runtimePath
    },
    server,
    types: join(__dirname, 'types')
  };
}
