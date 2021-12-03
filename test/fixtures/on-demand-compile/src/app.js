import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';

const getApp = App => {
  const MyApp = () => <App />;

  MyApp.getInitialProps = async () => {
    await Promise.all(getRoutes(routes).map(r => r.component.preload()));
  };
  return MyApp;
};

export default getApp;
