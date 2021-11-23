import { dynamic } from '@shuvi/app';
const DynamicComponent = dynamic(
  () => handleImport(import('./components/hello')),
  {
    webpack: () => [require.resolve('./components/hello')],
    modules: ['./components/hello'],
    loading: () => null,
    ssr: false
  }
);
