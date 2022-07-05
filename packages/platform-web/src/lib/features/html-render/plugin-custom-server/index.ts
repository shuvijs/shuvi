import { createPlugin } from '@shuvi/service';
import {
  getAllFiles,
  getFirstModuleExport,
  getUserCustomFileCandidates
} from '@shuvi/service/lib/project/file-utils';
import server from './server';

const core = createPlugin({
  addRuntimeFile: ({ createFile }, context) => {
    const { paths } = context;

    const serverCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'server',
      'noop'
    );
    const userServerFile = createFile({
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

export default { core, server };
