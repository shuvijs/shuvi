import path from 'path';
import fse from 'fs-extra';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import { getApi, IConfig, ICliContext } from '../api';
import { getBundler } from '../bundler/bundler';
import { BUILD_DEFAULT_DIR } from '../constants';

export interface IBuildOptions {
  cwd?: string;
  config?: IConfig;
  configFile?: string;
  target?: 'spa' | 'ssr';
}

const defaultBuildOptions = {
  target: 'ssr'
} as const;

async function bundle(context: ICliContext) {
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

function copyPublicFolder(context: ICliContext) {
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

  const { cliContext } = api;

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fse.emptyDirSync(cliContext.paths.buildDir);

  // Merge with the public folder
  copyPublicFolder(cliContext);

  // transpile the application
  await bundle(cliContext);
  cliContext.pluginRunner.afterBuild();
  return cliContext;
}
