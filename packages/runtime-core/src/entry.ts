import './public-path';
import './setup';
import { router } from '@shuvi/app';
import { rerender } from './setup-app';

(window as any).__SHUVI = {
  router, // used in e2e test
  rerender
};

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./entry.dev');
} else {
  module.exports = require('./entry.prod');
}
