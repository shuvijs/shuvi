import '@shuvi/platform-web/shuvi-type-extensions-node';

export { ShuviMode, ShuviPhase } from './types';
export { ShuviConfig, loadConfig, defineConfig } from './config';
export type { PresetFunction } from '@shuvi/service';
export {
  // api
  createPlugin,
  createServerPlugin,
  // constants
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_DEVELOPMENT_SERVER,
  PHASE_INSPECT_WEBPACK
} from '@shuvi/service';
