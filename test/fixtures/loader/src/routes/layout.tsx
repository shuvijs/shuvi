import { RouterView, useLoaderData, Loader } from '@shuvi/runtime';
import { normalizeContextForSerialize } from '../utils';

export default function RootLayout() {
  useLoaderData();
  return (
    <div>
      <RouterView />
    </div>
  );
}

export const loader: Loader = async ctx => {
  return normalizeContextForSerialize(ctx);
};
