import { useRouter } from '@shuvi/app';

const getApp = (App) => {
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
  return MyApp
}

export default getApp;
