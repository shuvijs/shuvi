import { RouterView, useLoaderData, Loader } from '@shuvi/runtime';
import { normalizeContextForSerialize } from '../utils';

export default function RootLayout() {
  const data = useLoaderData();
  return (
    <div>
      <div data-test-id="root-layout">{JSON.stringify(data)}</div>
      <RouterView />
    </div>
  );
}

export const loader: Loader = async ctx => {
  return normalizeContextForSerialize(ctx);
};
