import { useLocation } from '@shuvi/app';

export default () => {
  const { query } = useLocation();
  return <div id="query">{JSON.stringify(query)}</div>;
};
