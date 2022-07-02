import { useLoaderData, Link, Loader } from '@shuvi/runtime';
import { sleep } from '../../../utils';

function App() {
  const data = useLoaderData<{ path: string }>();
  return (
    <div>
      This is {data.path}
      <div>
        <Link to={`/parent/foo/a?sssss=2222`}>Add Query</Link>
        <br />
        <Link to={`/parent/bar/a`}>Go To /bar/a</Link>
      </div>
    </div>
  );
}

export const loader: Loader = async ({ pathname }) => {
  console.log('loader foo a start');
  await sleep(100);
  console.log('loader foo a end');
  return {
    path: pathname
  };
};

export default App;
