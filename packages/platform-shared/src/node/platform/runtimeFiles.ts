import { IPluginContext } from '@shuvi/service';
import { fileUtils } from '@shuvi/service/lib/project';
import { createProjectContext } from '../project/projectContext';
import { getFilePresets } from '../project/file-presets';

export const getRuntimeConfigFromConfig = async (
  pluginContext: IPluginContext
) => {
  const { pluginRunner, config } = pluginContext;
  return await pluginRunner.modifyRuntimeConfig({
    public: config.publicRuntimeConfig || {},
    server: config.runtimeConfig || {}
  });
};

/**
 * A creator for `getPresetRuntimeFiles` which helps platforms to build a bunch of runtime files including
 * `core/app`, `core/error`, `core/platform`, `core/plugins`, `core/polyfill`, `core/runtimeConfig`, `core/setRuntimeConfig`,
 * `user/app`, `user/error`, `user/runtime` and `entry`
 */
export const getPresetRuntimeFilesCreator =
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
    const { public: publicRuntimeConfig, server: serverRuntimeConfig } =
      await getRuntimeConfigFromConfig(pluginContext);
    context.runtimeConfig = {
      ...serverRuntimeConfig,
      ...publicRuntimeConfig
    };
    const runner = pluginContext.pluginRunner;
    const appPolyfills = (await runner.addPolyfill()).flat();
    const appEntryCodes = (await runner.addEntryCode()).flat();
    context.entryCodes.push(entry, ...appEntryCodes);
    context.polyfills.push(...polyfills, ...appPolyfills);
    const files = getFilePresets(context);
    return files;
  };
