import { useCurrentRoute } from '@shuvi/app/services/router-react';

export default () => {
  const { query } = useCurrentRoute();
  return <div id="query">{JSON.stringify(query)}</div>;
};
