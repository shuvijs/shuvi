import * as path from 'path';
import * as fse from 'fs-extra';
import { IPluginContext } from '@shuvi/service';
import { fileUtils } from '@shuvi/service/project';
import {
  CLIENT_BUILD_MANIFEST_PATH,
  SERVER_BUILD_MANIFEST_PATH,
  CLIENT_OUTPUT_DIR,
  SERVER_OUTPUT_DIR,
  BUILD_SERVER_FILE_SERVER
} from '../../../../shared';

const generateResources = (context: IPluginContext) => {
  const { resolveUserFile, paths } = context;
  const resourcesDir = path.dirname(paths.resourcesFile);
  const { buildDir } = context.paths;
  const clientManifestRequest = fileUtils.urlToRequest(
    path.relative(
      resourcesDir,
      path.join(buildDir, CLIENT_OUTPUT_DIR, CLIENT_BUILD_MANIFEST_PATH)
    )
  );
  const serverManifestRequest = fileUtils.urlToRequest(
    path.relative(
      resourcesDir,
      path.join(buildDir, SERVER_OUTPUT_DIR, SERVER_BUILD_MANIFEST_PATH)
    )
  );
  const serverModuleDir = path.relative(
    resourcesDir,
    path.join(buildDir, SERVER_OUTPUT_DIR)
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
  let documentPath: string;
  if (fse.existsSync(customDoc)) {
    documentPath = path.relative(process.cwd(), customDoc);
  } else {
    documentPath = path.relative(
      process.cwd(),
      require.resolve('@shuvi/platform-shared/template/document.ejs')
    );
  }

  result.push([`documentPath = "${documentPath}"`, undefined]);

  return result;
};

export default generateResources;
