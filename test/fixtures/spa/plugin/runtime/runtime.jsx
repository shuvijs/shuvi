import { createRuntimePlugin } from '@shuvi/runtime';

export default option =>
  createRuntimePlugin({
    appComponent: App => {
      const newApp = () => (
        <div id="runtime-plugin-xrHRS0jMox">
          <App />
        </div>
      );
      return newApp;
    }
  });
