import { createPlugin } from '@shuvi/platform-shared/lib/runtime/lifecycle';
import { dynamic } from "@shuvi/runtime";

const Hello = dynamic(() => import("./hello.jsx"), {
  ssr: false,
  loading: () => <p class="dynamic-loader">LOADING</p>
});

export default option =>
  createPlugin({
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
