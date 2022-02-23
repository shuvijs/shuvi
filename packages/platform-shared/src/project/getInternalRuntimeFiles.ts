import { IPluginContext, normalizePlugin } from '@shuvi/service';
import { fileUtils } from '@shuvi/service/lib/project';
import { createProjectContext } from './projectContext';
import { getFilePresets } from './file-presets';

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
