import path from 'path';
import fse from 'fs-extra';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
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

  result.push([
    'clientManifest',
    path.join(buildDir, BUILD_DEFAULT_DIR, BUILD_MANIFEST_PATH)
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
    '@shuvi/platform-core/template/document.ejs'
  );
  if (fse.existsSync(customDoc)) {
    documentPath = customDoc;
  }

  result.push([`documentPath = "${documentPath}"`, undefined]);

  return result;
};

export default generateResources;
