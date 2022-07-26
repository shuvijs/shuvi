export {};
import { HookMap } from '@shuvi/hook';
declare global {
  namespace ShuviService {
    interface CustomConfig {}
    interface CustomAppContext {}
    interface CustomCorePluginHooks extends HookMap {}
    interface CustomServerPluginHooks extends HookMap {}
  }
}
