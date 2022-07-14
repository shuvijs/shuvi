import { createPlugin } from '@shuvi/service';
import {
  getAllFiles,
  getFirstModuleExport,
  getUserCustomFileCandidates
} from '@shuvi/service/lib/project/file-utils';
import { resolvePkgFile } from '../../paths';
import server from './server';

const core = createPlugin({
  addRuntimeFile: ({ defineFile }, context) => {
    const { paths } = context;

    const serverCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'server',
      'noop'
    );
    const userServerFile = defineFile({
      name: 'user/server.js',
      content: () => {
        return getFirstModuleExport(
          getAllFiles(serverCandidates),
          serverCandidates
        );
      },
      dependencies: serverCandidates
    });
    return [userServerFile];
  }
});

export default {
  core,
  server,
  types: resolvePkgFile('lib/node/features/custom-server/shuvi-app.d.ts')
};
