import { IRouteLoaderContext } from '@shuvi/platform-shared/lib/runtime';

export type Nullable = null | void | undefined;

export type Loader<T = any> = (
  loaderContenxt: IRouteLoaderContext
) => Promise<T | Nullable> | T | Nullable;

export type LoaderData<T = any> = {
  data: T | null;
  error?: Error | Error['message'];
  loading?: boolean;
};

export type LoadersData = Record<string, LoaderData>;
