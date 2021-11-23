import { aaa, dynamic, vvv } from '@shuvi/app';

const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  { loading: () => <p>...</p> }
);
