export { ShuviMode, ShuviPhase } from './types';
export { ShuviConfig } from './config';

export {
  // api
  defineConfig,
  createPlugin,
  createServerPlugin,
  // constants
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_DEVELOPMENT_SERVER,
  PHASE_INSPECT_WEBPACK
} from '@shuvi/service';
