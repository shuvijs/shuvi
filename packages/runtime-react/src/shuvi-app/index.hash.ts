if (__BROWSER__) {
  module.exports = require('./view/clientView.hash');
} else {
  module.exports = require('./view/serverView');
}
