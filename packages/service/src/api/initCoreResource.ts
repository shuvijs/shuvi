import path from 'path';
import fse from 'fs-extra';
import { parseTemplateFile } from '../lib/viewTemplate';
import {
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER
} from '../constants';
import { Api } from './api';

function resolveServerDist(api: Api, name: string) {
  const manifest = api.resources.serverManifest;
  return path.join(
    api.paths.buildDir,
    BUILD_SERVER_DIR,
    manifest.bundles[name]
  );
}

function resolveDocument(api: Api) {
  const customDoc = api.resolveUserFile('document.ejs');
  if (fse.existsSync(customDoc)) {
    return customDoc;
  }

  return require.resolve('@shuvi/platform-core/template/document.ejs');
}

export function initCoreResource(api: Api) {
  api.addResoure('clientManifest', () =>
    require(path.join(
      api.paths.buildDir,
      BUILD_CLIENT_DIR,
      BUILD_MANIFEST_PATH
    ))
  );
  api.addResoure('serverManifest', () =>
    require(path.join(
      api.paths.buildDir,
      BUILD_SERVER_DIR,
      BUILD_MANIFEST_PATH
    ))
  );
  api.addResoure('server', () =>
    require(resolveServerDist(api, BUILD_SERVER_FILE_SERVER))
  );
  api.addResoure('documentTemplate', () =>
    parseTemplateFile(resolveDocument(api))
  );
}
