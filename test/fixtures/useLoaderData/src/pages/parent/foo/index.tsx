import { RouterView, useLoaderData, Loader } from '@shuvi/runtime';
import { sleep } from '../../../utils';

function App() {
  const data = useLoaderData<{ foo: string }>();
  return (
    <div>
      This is /parent/foo{data?.foo}
      <RouterView />
    </div>
  );
}

export const loader: Loader = async ({ params }) => {
  console.log('loader foo start');
  await sleep(300);
  console.log('loader foo end');
  return {
    foo: params.foo
  };
};

export default App;
