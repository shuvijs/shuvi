import { IRouteLoaderContext } from '@shuvi/platform-shared/lib/runtime';

export type Loader<T = any> = (
  loaderContenxt: IRouteLoaderContext
) => Promise<T | null> | T | null;

export type LoaderData<T = any> = {
  data: T | null;
  error?: Error | Error['message'];
  loading?: boolean;
};

export type LoadersData = Record<string, LoaderData>;
