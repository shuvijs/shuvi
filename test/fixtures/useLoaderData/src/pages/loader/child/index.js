import { useLoaderData, Link } from '@shuvi/runtime';
import { sleep } from '../../../utils';

function App() {
  const data = useLoaderData();
  return (
    <div>
      This is {data?.hello}
      <div>
        <Link to={`/loader/child?sssss=${Date.now()}`}>Go query</Link>
        <Link to={`/loader`}>Go To /loader</Link>
      </div>
    </div>
  );
}

export const loader = async () => {
  await sleep(300);
  console.log('loader child fetched');
  return {
    hello: 'loader child'
  };
};

export default App;
