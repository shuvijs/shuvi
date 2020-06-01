import './public-path';
import './setup';
import { router } from '@shuvi/app';

(window as any).__SHUVI = {
  router
};

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./entry.dev');
} else {
  module.exports = require('./entry.prod');
}
