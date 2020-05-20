import { router } from '@shuvi/app';

export default () => <div id="query">{JSON.stringify(router.query)}</div>;
