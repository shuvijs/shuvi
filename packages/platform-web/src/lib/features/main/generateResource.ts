import * as path from 'path';
import * as fse from 'fs-extra';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_ASSET_DIR,
  PUBLIC_PATH,
  IPluginContext
} from '@shuvi/service';

const generateResources = (context: IPluginContext) => {
  const { resolveUserFile } = context;
  const { buildDir } = context.paths;
  const serverManifestPath = path.join(
    buildDir,
    BUILD_SERVER_DIR,
    BUILD_MANIFEST_PATH
  );

  const result: [string, string | undefined][] = [];

  let dir = BUILD_DEFAULT_DIR;
  if (context.config.publicPath === PUBLIC_PATH) {
    dir = `${BUILD_DEFAULT_DIR}/${BUILD_CLIENT_ASSET_DIR}`;
  }
  result.push([
    'clientManifest',
    path.join(buildDir, dir, BUILD_MANIFEST_PATH)
  ]);
  result.push(['serverManifest', serverManifestPath]);

  result.push([
    `server = function() {
    var path = require('path');
    return require(path.join(
      '${buildDir}',
      '${BUILD_SERVER_DIR}',
      require('${serverManifestPath}')['bundles']['${BUILD_SERVER_FILE_SERVER}']
    ))
  }`,
    undefined
  ]);

  const customDoc = resolveUserFile('document.ejs');
  let documentPath = require.resolve(
    '@shuvi/platform-shared/template/document.ejs'
  );
  if (fse.existsSync(customDoc)) {
    documentPath = customDoc;
  }

  result.push([`documentPath = "${documentPath}"`, undefined]);

  return result;
};

export default generateResources;
