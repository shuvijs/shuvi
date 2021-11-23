import { aaa, dynamic, vvv } from '@shuvi/app';
const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello'),
  {
    webpack: () => [require.resolveWeak('../components/hello')],
    modules: ['../components/hello'],
    loading: () => <p>...</p>
  }
);
