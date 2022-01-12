import { aaa, dynamic, vvv } from '@shuvi/runtime';

const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  { loading: () => <p>...</p> }
);
