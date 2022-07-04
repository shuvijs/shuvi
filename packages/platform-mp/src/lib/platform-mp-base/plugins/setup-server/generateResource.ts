import * as path from 'path';
import {
  BUILD_SERVER_DIR,
  SERVER_BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
  IPluginContext
} from '@shuvi/service';

const generateResources = (context: IPluginContext) => {
  const { buildDir } = context.paths;
  const serverManifestPath = path.join(
    buildDir,
    BUILD_SERVER_DIR,
    SERVER_BUILD_MANIFEST_PATH
  );

  const result: [string, string | undefined][] = [
    [
      `server = function() {
    var path = require('path');
    return require(path.join(
      '${buildDir}',
      '${BUILD_SERVER_DIR}',
      require('${serverManifestPath}')['bundles']['${BUILD_SERVER_FILE_SERVER}']
    ))
  }`,
      undefined
    ]
  ];

  return result;
};

export default generateResources;
