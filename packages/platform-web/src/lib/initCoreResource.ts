import path from 'path';
import fse from 'fs-extra';
import { parseTemplateFile } from './viewTemplate';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
  ICliContext
} from '@shuvi/service';

function resolveServerDist(api: ICliContext, name: string) {
  const manifest = api.resources.serverManifest;
  return path.join(
    api.paths.buildDir,
    BUILD_SERVER_DIR,
    manifest.bundles[name]
  );
}

function resolveDocument(api: ICliContext) {
  const customDoc = api.resolveUserFile('document.ejs');
  if (fse.existsSync(customDoc)) {
    return customDoc;
  }

  return require.resolve('@shuvi/platform-core/template/document.ejs');
}

export const getCoreResources = (context: ICliContext) => {
  const { buildDir } = context.paths;
  return [
    {
      identifier: 'clientManifest',
      loader: () =>
        require(path.join(buildDir, BUILD_DEFAULT_DIR, BUILD_MANIFEST_PATH))
    },
    {
      identifier: 'serverManifest',
      loader: () =>
        require(path.join(buildDir, BUILD_SERVER_DIR, BUILD_MANIFEST_PATH))
    },
    {
      identifier: 'server',
      loader: () =>
        require(resolveServerDist(context, BUILD_SERVER_FILE_SERVER))
    },
    {
      identifier: 'documentTemplate',
      loader: () => parseTemplateFile(resolveDocument(context))
    }
  ];
};
