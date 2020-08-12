import { useRouter } from '@shuvi/app';

export default () => {
  const router = useRouter();
  return <div id="query">{JSON.stringify(router.query)}</div>;
};
