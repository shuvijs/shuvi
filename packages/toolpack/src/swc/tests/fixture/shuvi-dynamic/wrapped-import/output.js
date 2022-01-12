import { dynamic } from '@shuvi/runtime';
const DynamicComponent = dynamic(
  () => handleImport(import('./components/hello')),
  {
    webpack: () => [require.resolveWeak('./components/hello')],
    modules: ['./components/hello'],
    loading: () => null,
    ssr: false
  }
);
