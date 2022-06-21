import { RouterView, useRouter, Link } from '@shuvi/runtime';
import { useEffect } from 'react';

function App() {
  const router = useRouter();
  useEffect(() => {
    router.afterEach(() => {
      console.log('afterEach called');
    });
  }, []);
  return (
    <div>
      <div>This is parent</div>
      <div>
        <Link to={'/parent/foo/a'}>To /parent/foo/a</Link>
      </div>
      <RouterView />
    </div>
  );
}

export default App;
