import { useLoaderData } from '@shuvi/runtime';
import sample from '@shuvi/app/files/sample';

const Page = () => {
  const data = useLoaderData();
  return (
    <div>
      <div data-test-id="content">Index Page {sample}</div>
      <div data-test-id="time">{data.time}</div>
    </div>
  );
};

export const loader = async () => {
  return {
    time: 1
  };
};

export default Page;
