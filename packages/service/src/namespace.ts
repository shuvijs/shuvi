export {};
import { HookMap } from '@shuvi/hook';
declare global {
  namespace ShuviService {
    interface CustomConfig {}
    interface CustomCorePluginHooks extends HookMap {}
    interface CustomServerPluginHooks extends HookMap {}
  }
}
