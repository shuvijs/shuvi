import { dynamic } from '@shuvi/runtime';

const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  { loading: () => <p>...</p> },
  '3rd'
);
