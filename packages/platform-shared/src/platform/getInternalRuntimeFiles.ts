import { IPluginContext, normalizePlugin } from '@shuvi/service';
import { fileUtils } from '@shuvi/service/lib/project';
import { createProjectContext } from '../project/projectContext';
import { getFilePresets } from '../project/file-presets';

export const getRuntimeConfigFromConfig = async (
  pluginContext: IPluginContext
) => {
  const { pluginRunner, config } = pluginContext;
  return await pluginRunner.modifyRuntimeConfig(config.runtimeConfig || {});
};

/**
 * A creator for `getInternalRuntimeFiles` which helps platforms to build a bunch of runtime files including
 * `core/app`, `core/error`, `core/platform`, `core/plugins`, `core/polyfill`, `core/runtimeConfig`, `core/setRuntimeConfig`,
 * `user/app`, `user/error`, `user/runtime` and `entry`
 */
export const getInternalRuntimeFilesCreator =
  (platformModule: string, entry: string, polyfills: string[]) =>
  async (pluginContext: IPluginContext) => {
    const getCandidates = (
      fileName: string,
      fallbackType: 'nullish' | 'noop' | 'noopFn'
    ): string[] =>
      fileUtils.getUserCustomFileCandidates(
        pluginContext.paths.rootDir,
        fileName,
        fallbackType
      );

    const context = createProjectContext();
    context.userModule = {
      app: getCandidates('app', 'nullish'),
      error: getCandidates('error', 'nullish'),
      runtime: getCandidates('runtime', 'noop')
    };
    context.platformModule = platformModule;
    context.runtimeConfig = await getRuntimeConfigFromConfig(pluginContext);
    const runner = pluginContext.pluginRunner;
    const appPolyfills = (await runner.addPolyfill()).flat();
    const appEntryCodes = (await runner.addEntryCode()).flat();
    const runtimePlugins = (await runner.addRuntimePlugin())
      .flat()
      .map(normalizePlugin);
    context.entryCodes.push(entry, ...appEntryCodes);
    context.polyfills.push(...polyfills, ...appPolyfills);
    context.runtimePlugins.push(...runtimePlugins);
    const files = getFilePresets(context);
    return files;
  };
