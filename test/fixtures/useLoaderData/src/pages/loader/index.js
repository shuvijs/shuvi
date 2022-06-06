import { RouterView, useLoaderData, Link } from '@shuvi/runtime';
import { sleep } from '../../utils';

function App() {
  const data = useLoaderData();
  return (
    <div>
      <div>This is {data?.hello}</div>
      <Link to={`/loader/child`}>Go To /loader/child</Link>
      <RouterView />
    </div>
  );
}

export const loader = async ctx => {
  await sleep(2000);
  console.log('loader parent fetched', ctx);
  return {
    hello: 'loader parent'
  };
};

export const aa = 11;

export default App;
