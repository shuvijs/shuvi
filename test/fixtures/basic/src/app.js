import { App, useRouter } from '@shuvi/runtime';
import React from 'react';

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
