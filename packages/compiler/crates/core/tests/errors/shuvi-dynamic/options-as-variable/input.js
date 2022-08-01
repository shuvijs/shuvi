import { dynamic } from '@shuvi/runtime';

const options = { loading: () => <p>...</p>, ssr: false };
const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  options
);
