declare const __BROWSER__: boolean;
if (__BROWSER__) {
  module.exports = require('./view/clientView');
} else {
  module.exports = require('./view/serverView');
}
