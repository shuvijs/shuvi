import '@shuvi/platform-web/lib/hooks'
import '@shuvi/platform-web/lib/serverPlugin/hooks'
import { CreatePlugin } from '@shuvi/hook'
import {
  createPlugin as originalCreatePlugin, InternalPluginHooks, IPluginContext, PluginHooks,
  createServerPlugin as originalCreateServerPlugin, InternalServerPluginHooks, IServerPluginContext, ServerPluginHooks
} from '@shuvi/service'

// modules with module augmentation cannot be exported directly
export const createPlugin: CreatePlugin<InternalPluginHooks, IPluginContext, PluginHooks> = originalCreatePlugin
export const createServerPlugin: CreatePlugin<InternalServerPluginHooks, IServerPluginContext, ServerPluginHooks> = originalCreateServerPlugin
