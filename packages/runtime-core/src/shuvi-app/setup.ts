// IMPORTANT: `setup-env` must be runned before any other codes
import './setup-env';
import { rerender } from './setup-app';
import { router } from '@shuvi/app';

(window as any).__SHUVI = {
  router, // used in e2e test
  rerender
};
