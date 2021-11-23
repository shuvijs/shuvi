import { dynamic } from '@shuvi/app';
const DynamicComponent = dynamic(
  () => handleImport(import('./components/hello')),
  {
    webpack: () => [require.resolveWeak('./components/hello')],
    modules: ['./components/hello'],
    loading: () => null,
    ssr: false
  }
);
