import { useLoaderData } from '@shuvi/runtime';

export default function ExportOther() {
  const data = useLoaderData();
  return <div>ExportOther-default-symbol {data.loader}</div>;
}

export const loader = async ctx => {
  return {
    loader: 'ExportOther-loader-symbol'
  };
};

export const other = function () {
  console.log('ExportOther-other-symbol');
};
