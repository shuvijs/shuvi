import { App } from '@shuvi/app';
import pageRoutes from '@shuvi/app/core/pageRoutes';

const MyApp = () => <App />;

MyApp.getInitialProps = async () => {
  await Promise.all(pageRoutes.map(r => r.component.preload()));
};

export default MyApp;
