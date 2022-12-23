import * as path from 'path';
import * as fs from 'fs-extra';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import { IPluginContext, Bundler, ShuviConfig, analysis } from '@shuvi/service';
import { CLIENT_OUTPUT_DIR } from '@shuvi/shared/constants';
import logger from '@shuvi/utils/lib/logger';
import { initShuvi } from '../shuvi';

export interface IBuildOptions {
  config?: ShuviConfig;
  cwd?: string;
  target?: 'spa' | 'ssr';
  configFile?: string;
}

const defaultBuildOptions = {
  target: 'ssr'
} as const;

async function bundle(bundler: Bundler) {
  const result = await bundler.build();
  const messages = formatWebpackMessages(result);
  // If errors exist, only show errors.
  if (messages.errors.length) {
    // Only keep the first error. Others are often indicative
    // of the same problem, but confuse the reader with noise.
    throw new Error((messages as any).errors[0]);
  }

  // Show warnings if no errors were found.
  if (messages.warnings.length) {
    logger.warn('Compiled with warnings.\n');
    logger.warn(messages.warnings.join('\n\n'));
  }
}

function copyPublicFolder(context: IPluginContext) {
  if (!fs.existsSync(context.paths.publicDir)) {
    return;
  }

  fs.copySync(
    context.paths.publicDir,
    path.join(context.paths.buildDir, CLIENT_OUTPUT_DIR),
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

  const api = await initShuvi({
    cwd: opts.cwd,
    mode: 'production',
    config: opts.config || {},
    configFile: opts.configFile,
    phase: 'PHASE_PRODUCTION_BUILD'
  });

  // generate application
  await api.buildApp();

  const { pluginContext } = api;

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(pluginContext.paths.buildDir);

  // Merge with the public folder
  copyPublicFolder(pluginContext);

  const bundler = await api.getBundler();
  // transpile the application
  await bundle(bundler);
  await pluginContext.pluginRunner.afterBuild();
  await analysis({ context: api.pluginContext, telemetry: api.telemetry });
  await api.telemetry.flush();
  return api;
}
