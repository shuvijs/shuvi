import { dynamic } from '@shuvi/app';
const DynamicComponent = dynamic(
  () => handleImport(import('./components/hello')),
  {
    loading: () => null,
    ssr: false
  }
);
