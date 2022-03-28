const { createPlugin } = require('@shuvi/platform-shared/lib/runtime/lifecycle');

module.exports = option =>
  createPlugin({
    getAppComponent: App => {
      const newApp = () => (
        <div>
          <div>This is getAppComponent {option.hello}</div>
          <App />
        </div>
      );
      return newApp;
    },
    getRootAppComponent: App => {
      const newApp = () => (
        <div>
          <div>This is getRootAppComponent</div>
          <App />
        </div>
      );
      return newApp;
    }
  });