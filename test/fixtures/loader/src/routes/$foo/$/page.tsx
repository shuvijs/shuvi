import { useLoaderData, Loader, useParams } from '@shuvi/runtime';
import { normalizeContextForSerialize } from '../../../utils';

function App() {
  const data = useLoaderData();
  const params = useParams();
  // console.log(params['*'])
  return <div data-test-id="foo">{JSON.stringify(data)}</div>;
}

export const loader: Loader = async ctx => {
  return normalizeContextForSerialize(ctx);
};

export default App;
