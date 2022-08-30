import { useLoaderData } from '@shuvi/runtime';

export default function Component() {
  const data = useLoaderData();
  return (
    <div id="content">
      function-declaration-async-component-symbol {data.loader}
    </div>
  );
}

export async function loader(ctx) {
  return {
    loader: 'function-declaration-async-loader-symbol'
  };
}
