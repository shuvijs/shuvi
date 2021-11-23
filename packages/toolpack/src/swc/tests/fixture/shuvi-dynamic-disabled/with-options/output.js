import { aaa, dynamic, vvv } from '@shuvi/app';
const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  {
    webpack: () => [require.resolve('../components/hello')],
    modules: ['../components/hello'],
    loading: () => <p>...</p>
  }
);
