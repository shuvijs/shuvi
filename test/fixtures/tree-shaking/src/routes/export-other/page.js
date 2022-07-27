import { useLoaderData } from '@shuvi/runtime';

export default function ExportOther() {
  const data = useLoaderData();
  return <div>ExportOther-symbol {data.otherPage}</div>;
}

export const loader = async () => {
  return {
    otherPage: 'otherPage-symbol'
  };
};

const other = function () {
  console.log('other-symbol');
};

export { other };
