import path from 'path';
import fse from 'fs-extra';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import {
  getApi,
  UserConfig,
  IPluginContext,
  getBundler,
  BUILD_DEFAULT_DIR
} from '@shuvi/service';

export interface IBuildOptions {
  cwd?: string;
  config?: UserConfig;
  configFile?: string;
  target?: 'spa' | 'ssr';
}

const defaultBuildOptions = {
  target: 'ssr'
} as const;

async function bundle(context: IPluginContext) {
  const bundler = getBundler(context);
  const result = await bundler.build();
  const messages = formatWebpackMessages(result);

  // If errors exist, only show errors.
  if (messages.errors.length) {
    // Only keep the first error. Others are often indicative
    // of the same problem, but confuse the reader with noise.
    throw new Error(messages.errors[0]);
  }

  // Show warnings if no errors were found.
  if (messages.warnings.length) {
    console.log('Compiled with warnings.\n');
    console.log(messages.warnings.join('\n\n'));
  }
}

function copyPublicFolder(context: IPluginContext) {
  if (!fse.existsSync(context.paths.publicDir)) {
    return;
  }

  fse.copySync(
    context.paths.publicDir,
    path.join(context.paths.buildDir, BUILD_DEFAULT_DIR),
    {
      dereference: true
    }
  );
}

export async function build(options: IBuildOptions) {
  const opts = {
    ...defaultBuildOptions,
    ...options
  };
  // target `spa` is an alias for `web/react/spa`
  const config = opts.config || {};
  if (opts.target === 'spa') {
    config.platform = {
      name: 'web',
      framework: 'react',
      target: 'spa'
    };
  }
  const api = await getApi({
    cwd: opts.cwd,
    mode: 'production',
    config: opts.config,
    configFile: opts.configFile,
    phase: 'PHASE_PRODUCTION_BUILD'
  });

  // generate application
  await api.buildApp();

  const { pluginContext } = api;

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fse.emptyDirSync(pluginContext.paths.buildDir);

  // Merge with the public folder
  copyPublicFolder(pluginContext);

  // transpile the application
  await bundle(pluginContext);
  pluginContext.pluginRunner.afterBuild();
  return pluginContext;
}
