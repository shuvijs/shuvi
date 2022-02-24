const { createPlugin } = require('@shuvi/runtime-core');

module.exports = option =>
  createPlugin({
    getAppComponent: App => {
      const newApp = () => (
        <div>
          <div>This is getAppComponent {option}</div>
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
