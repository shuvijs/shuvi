import { router, App } from '@shuvi/app';

// should access router instance
if (typeof window !== 'undefined') {
  router.onChange(() => {
    console.log('history change');
  });
}

const MyApp = () => <App />;

export default MyApp;
