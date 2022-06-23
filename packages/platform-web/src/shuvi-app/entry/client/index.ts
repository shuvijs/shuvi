// This is the shuvi client-side entry
// IMPORTANT: `setup-env` must be runned before any other codes
import './setup-env';
import './setup-app';

if (process.env.NODE_ENV === 'development') {
  require('./run.dev');
} else {
  require('./run.prod');
}
