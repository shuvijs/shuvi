import { useLoaderData } from '@shuvi/runtime';

export default function Component() {
  const data = useLoaderData();
  return (
    <div id="content">
      function-declaration-normal-component-symbol {data.loader}
    </div>
  );
}

export function loader(ctx) {
  return {
    loader: 'function-declaration-normal-loader-symbol'
  };
}
