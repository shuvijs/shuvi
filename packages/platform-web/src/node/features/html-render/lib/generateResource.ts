import * as path from 'path';
import * as fse from 'fs-extra';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  CLIENT_BUILD_MANIFEST_PATH,
  SERVER_BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
  IPluginContext
} from '@shuvi/service';
import { urlToRequest } from '@shuvi/service/lib/project/file-utils';

const generateResources = (context: IPluginContext) => {
  const { resolveUserFile } = context;
  const { buildDir } = context.paths;
  // fixme: windows下面REQUIRE json文件不能用FILE协议，有点莫名其妙
  const clientManifestRequest = urlToRequest(
    path.join(buildDir, BUILD_DEFAULT_DIR, CLIENT_BUILD_MANIFEST_PATH),
    false
  );
  const serverManifestRequest = urlToRequest(
    path.join(buildDir, BUILD_SERVER_DIR, SERVER_BUILD_MANIFEST_PATH),
    false
  );
  const serverModuleDir = urlToRequest(
    path.join(buildDir, BUILD_SERVER_DIR),
    false
  );
  const result: [string, string | undefined][] = [];

  result.push(['clientManifest', clientManifestRequest]);
  result.push(['serverManifest', serverManifestRequest]);

  result.push([
    `server = function() {
    const path = require('path');
    const relativeModulePath = require('${serverManifestRequest}')['bundles']['${BUILD_SERVER_FILE_SERVER}'];
    const modulePath = require.resolve(path.join("${serverModuleDir}", relativeModulePath));
    return require(modulePath)
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

  result.push([
    `documentPath = "${urlToRequest(documentPath, false)}"`,
    undefined
  ]);

  return result;
};

export default generateResources;
