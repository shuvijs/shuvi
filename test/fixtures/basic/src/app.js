import { App } from '@shuvi/services';
import { useRouter } from '@shuvi/services/router-react';

const MyApp = () => {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      router.listen(() => {
        console.log('history change');
      });
    }
  }, []);

  return <App />;
};

export default MyApp;
