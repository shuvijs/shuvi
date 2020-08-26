import { useCurrentRoute } from '@shuvi/app';

export default () => {
  const { query } = useCurrentRoute();
  return <div id="query">{JSON.stringify(query)}</div>;
};
