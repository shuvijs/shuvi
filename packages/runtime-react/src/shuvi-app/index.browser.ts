declare const __BROWSER__: boolean;

if (__BROWSER__) {
  module.exports = require('./view/clientView.browser');
} else {
  module.exports = require('./view/serverView');
}
