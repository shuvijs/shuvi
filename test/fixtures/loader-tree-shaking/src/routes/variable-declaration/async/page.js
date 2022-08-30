import { useLoaderData } from '@shuvi/runtime';

export default function Component() {
  const data = useLoaderData();
  return (
    <div id="content">
      variable-declaration-async-component-symbol {data.loader}
    </div>
  );
}

export const loader = async ctx => {
  return {
    loader: 'variable-declaration-async-loader-symbol'
  };
};
