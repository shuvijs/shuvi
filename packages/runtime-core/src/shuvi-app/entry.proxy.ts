if (process.env.NODE_ENV === 'development') {
  module.exports = require('./entry.dev');
} else {
  module.exports = require('./entry.prod');
}
