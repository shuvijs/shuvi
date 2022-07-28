import * as path from 'path';
import * as fs from 'fs-extra';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import { IPluginContext, getBundler, BUILD_DEFAULT_DIR } from '@shuvi/service';
import { ShuviConfig } from '../config';
import { initShuvi } from '../shuvi';

export interface IBuildOptions {
  cwd?: string;
  config: ShuviConfig;
  target?: 'spa' | 'ssr';
}

const defaultBuildOptions = {
  target: 'ssr'
} as const;

async function bundle(context: IPluginContext) {
  const bundler = await getBundler(context, {
    ignoreTypeScriptErrors: context.config.typescript.ignoreBuildErrors
  });
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
    console.log('Compiled with warnings.\n');
    console.log(messages.warnings.join('\n\n'));
  }
}

function copyPublicFolder(context: IPluginContext) {
  if (!fs.existsSync(context.paths.publicDir)) {
    return;
  }

  fs.copySync(
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
  const api = await initShuvi({
    cwd: opts.cwd,
    mode: 'production',
    config: opts.config,
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

  // transpile the application
  await bundle(pluginContext);
  await pluginContext.pluginRunner.afterBuild();
  return api;
}
