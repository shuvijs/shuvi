// shuvi built-in entry
// IMPORTANT: there files must be runned before any other codes
import './setup-env';

// user entry
import '@shuvi/app/core/entry';

// app starts here
if (process.env.NODE_ENV === 'development') {
  require('./run.dev');
} else {
  require('./run.prod');
}
