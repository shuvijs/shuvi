// IMPORTANT: `setup-env` must be runned before any other codes
import './setup-env';
import { rerender } from './setup-app';

(window as any).__SHUVI = {
  rerender
};
