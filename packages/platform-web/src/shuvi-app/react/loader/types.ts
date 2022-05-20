import { IRouteComponentContext } from '@shuvi/platform-shared/lib/runtime';

export type Loader<T> = (
  loaderContenxt: IRouteComponentContext
) => Promise<T | null>;

export type LoaderData<T = any> = {
  data: T | null;
  error?: Error | Error['message'];
  loading?: boolean;
};

export type LoadersData = Record<string, LoaderData>;
