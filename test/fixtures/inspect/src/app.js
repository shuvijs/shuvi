import App from '@shuvi/app/services/app';
import { useRouter } from '@shuvi/app/services/router-react';

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
