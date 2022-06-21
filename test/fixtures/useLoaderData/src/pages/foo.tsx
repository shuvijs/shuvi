import { useLoaderData, Loader } from '@shuvi/runtime';
import { normalizeContextForSerialize } from '../utils';

function App() {
  const data = useLoaderData();
  console.log('data', data);
  return <div data-test-id="foo">{JSON.stringify(data)}</div>;
}

export const loader: Loader = async ctx => {
  return normalizeContextForSerialize(ctx);
};

export default App;
