import { useLoaderData } from '@shuvi/runtime';

export default function ExportOther() {
  const data = useLoaderData();
  return <div>ExportOther-symbol {data.loader}</div>;
}

export const loader = async ctx => {
  return {
    loader: 'loader-symbol'
  };
};

export const other = function () {
  console.log('other-symbol');
};
