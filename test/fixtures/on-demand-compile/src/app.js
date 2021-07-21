import App from '@shuvi/app/services/app';
import routes from '@shuvi/app/core/routes';

const MyApp = () => <App />;

MyApp.getInitialProps = async () => {
  await Promise.all(routes.map(r => r.component.preload()));
};

export default MyApp;
