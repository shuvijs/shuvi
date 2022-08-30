import { useLoaderData } from '@shuvi/runtime';

export default function Component() {
  const data = useLoaderData();
  return (
    <div id="content">
      variable-declaration-normal-component-symbol {data.loader}
    </div>
  );
}

export const loader = ctx => {
  return {
    loader: 'variable-declaration-normal-loader-symbol'
  };
};
