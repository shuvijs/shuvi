import path from 'path';
import fse from 'fs-extra';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_FILE_SERVER,
  IPluginContext
} from '@shuvi/service';

const generateResources = (context: IPluginContext, isCache: boolean) => {
  const { addResources, resolveUserFile } = context;
  const { buildDir } = context.paths;
  const serverManifestPath = path.join(
    buildDir,
    BUILD_SERVER_DIR,
    BUILD_MANIFEST_PATH
  );
  const serverManifest = require(serverManifestPath);

  addResources(
    'clientManifest',
    path.join(buildDir, BUILD_DEFAULT_DIR, BUILD_MANIFEST_PATH),
    isCache
  );
  addResources('serverManifest', serverManifestPath, isCache);

  addResources(
    'server',
    path.join(
      buildDir,
      BUILD_SERVER_DIR,
      serverManifest.bundles[BUILD_SERVER_FILE_SERVER]
    ),
    isCache
  );

  const customDoc = resolveUserFile('document.ejs');
  let documentPath = require.resolve(
    '@shuvi/platform-core/template/document.ejs'
  );
  if (fse.existsSync(customDoc)) {
    documentPath = customDoc;
  }

  addResources(`documentPath = "${documentPath}"`, undefined, isCache);
};

export default generateResources;
