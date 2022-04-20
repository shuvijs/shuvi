import routes from '@shuvi/app/files/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import { App } from '@shuvi/runtime';

const MyApp = () => <App />;

MyApp.getInitialProps = async () => {
  await Promise.all(getRoutes(routes).map(r => r.component.preload()));
};

export default MyApp;
