import { App } from '@shuvi/services';
import routes from '@shuvi/app/core/routes';

const MyApp = () => <App />;

MyApp.getInitialProps = async () => {
  await Promise.all(routes.map(r => r.component.preload()));
};

export default MyApp;
