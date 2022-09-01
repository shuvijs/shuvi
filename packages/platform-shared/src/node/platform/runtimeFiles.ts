import { IPluginContext } from '@shuvi/service';
import { fileUtils } from '@shuvi/service/lib/project';
import {
  setRuntimeConfig,
  setPublicRuntimeConfig
} from '../../shared/shuvi-singleton-runtimeConfig';
import { createProjectContext } from '../project/projectContext';
import { getFilePresets } from '../project/file-presets';

/**
 * A creator for `getPresetRuntimeFiles` which helps platforms to build a bunch of runtime files including
 * `core/error`, `core/platform`, `core/plugins`, `core/polyfill`, `core/runtimeConfig`, `core/setRuntimeConfig`,
 * `user/error`, `user/runtime` and `entry`
 */
export const getPresetRuntimeFilesCreator =
  (platformModule: string) => async (pluginContext: IPluginContext) => {
    const { pluginRunner, config } = pluginContext;
    const getCandidates = (
      fileName: string,
      fallbackType: 'nullish' | 'noop' | 'noopFn'
    ): string[] =>
      fileUtils.getUserCustomFileCandidates(
        pluginContext.paths.rootDir,
        fileName,
        fallbackType
      );

    const { public: publicRuntimeConfig, server: serverRuntimeConfig } =
      await pluginRunner.modifyRuntimeConfig({
        public: config.publicRuntimeConfig || {},
        server: config.runtimeConfig || {}
      });
    const serverKeys = Object.keys(serverRuntimeConfig);
    const publicKeys = Object.keys(publicRuntimeConfig);
    for (let index = 0; index < serverKeys.length; index++) {
      const key = serverKeys[index];
      const hasSameKey = publicKeys.includes(key);
      if (hasSameKey) {
        console.warn(
          `Warning: key "${key}" exist in both "runtimeConfig" and "publicRuntimeConfig". Please rename the key, or the value from "publicRuntimeConfig" will be applied.\n`
        );
        break;
      }
    }
    if (serverKeys) {
      setRuntimeConfig(serverRuntimeConfig);
    }
    if (publicKeys) {
      setPublicRuntimeConfig(publicRuntimeConfig);
    }

    const context = createProjectContext();
    context.userModule = {
      error: getCandidates('error', 'nullish'),
      app: getCandidates('app', 'noop'),
      server: getCandidates('server', 'noop')
    };
    context.platformModule = platformModule;
    context.runtimeConfig = {
      ...serverRuntimeConfig,
      ...publicRuntimeConfig
    };
    const runner = pluginContext.pluginRunner;
    const appEntryCodes = (await runner.addEntryCode()).flat();
    context.entryCodes.push(...appEntryCodes);
    const files = getFilePresets(context);
    return files;
  };
