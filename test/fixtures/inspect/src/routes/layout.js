import React from 'react';
import { RouterView, useRouter } from '@shuvi/runtime';

const GlobalLayout = () => {
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

export default GlobalLayout;
