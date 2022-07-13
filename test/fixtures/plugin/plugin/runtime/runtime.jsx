import { createRuntimePlugin, dynamic } from '@shuvi/runtime';

const Hello = dynamic(() => import('./hello.jsx'), {
  ssr: false,
  loading: () => <p class="dynamic-loader">LOADING</p>
});

export default option =>
  createRuntimePlugin({
    appComponent: App => {
      const newApp = () => (
        <div>
          <div>This is getAppComponent {option.hello}</div>
          <App />
        </div>
      );
      return newApp;
    }
  });
