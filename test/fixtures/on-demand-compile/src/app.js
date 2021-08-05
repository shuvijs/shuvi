import { App } from '@shuvi/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';

const MyApp = () => <App />;

MyApp.getInitialProps = async () => {
  await Promise.all(getRoutes(routes).map(r => r.component.preload()));
};

export default MyApp;
