import { useCurrentRoute } from '@shuvi/runtime';

export default () => {
  const { query } = useCurrentRoute();
  return <div id="query">{JSON.stringify(query)}</div>;
};
