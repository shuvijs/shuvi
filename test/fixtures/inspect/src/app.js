import React from 'react';
import { App, useRouter } from '@shuvi/app';

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
