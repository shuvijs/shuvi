if (__BROWSER__) {
  module.exports = require('./clientView');
} else {
  module.exports = require('./serverView');
}
