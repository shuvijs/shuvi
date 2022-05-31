import React from 'react';
import { App, useRouter } from '@shuvi/runtime';

const MyApp = () => {
  const router = useRouter();

  React.useEffect(() => {
    let routerListener;
    if (typeof window !== 'undefined') {
      routerListener = router.listen(() => {
        console.log('history change');
      });
    }
    return () => routerListener();
  }, []);

  return <App />;
};

export default MyApp;
