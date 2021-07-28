// This is the shuvi client-side entry
// IMPORTANT: `setup-env` must be runned before any other codes
import './setup-env';
import { rerender } from './setup-app';

(window as any).__SHUVI = {
  ...((window as any).__SHUVI || {}),
  rerender
};

if (process.env.NODE_ENV === 'development') {
  require('./run.dev');
} else {
  require('./run.prod');
}
