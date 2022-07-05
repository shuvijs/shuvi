import { RouterView, useRouter } from '@shuvi/runtime';
import React from 'react';

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

  return <RouterView />;
};

export default MyApp;
