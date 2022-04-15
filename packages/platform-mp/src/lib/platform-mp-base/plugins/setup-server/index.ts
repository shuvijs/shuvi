import {
  createPlugin,
  BUILD_SERVER_FILE_SERVER,
  BUILD_SERVER_DIR
} from '@shuvi/service';
import {
  getUserCustomFileCandidates,
  getFisrtModuleExport
} from '@shuvi/service/lib/project/file-utils';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';

import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';

import generateResource from './generateResource';
import { resolveAppFile } from '../../../paths';

export default createPlugin({
  addResource: context => generateResource(context),
  addRuntimeFile: async ({ createFile, getAllFiles }, context) => {
    const serverCandidates = getUserCustomFileCandidates(
      context.paths.rootDir,
      'server',
      'noop'
    );
    const userServerFile = createFile({
      name: 'user/server.js',
      content: () => {
        return getFisrtModuleExport(
          getAllFiles(serverCandidates),
          serverCandidates
        );
      },
      dependencies: serverCandidates
    });
    return userServerFile;
  },
  addExtraTarget: ({ createConfig }) => {
    const serverWebpackHelpers = webpackHelpers();
    const serverChain = createConfig({
      name: BUNDLER_TARGET_SERVER,
      node: true,
      entry: {
        [BUILD_SERVER_FILE_SERVER]: resolveAppFile('entry', 'server')
      },
      outputDir: BUILD_SERVER_DIR,
      webpackHelpers: serverWebpackHelpers
    });
    return {
      name: BUNDLER_TARGET_SERVER,
      chain: serverChain
    };
  }
});
