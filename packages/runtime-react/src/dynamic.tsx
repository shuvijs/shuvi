import React from "react";
import Loadable from "./loadable";

const isServerSide = typeof window === "undefined";

export type LoaderComponent<P = {}> = Promise<
  React.ComponentType<P> | { default: React.ComponentType<P> }
>;

export type Loader<P = {}> = () => LoaderComponent<P>;

export type LoadableGeneratedOptions = {
  webpack?(): () => string[];
  modules?: string[];
};

export type LoadableBaseOptions<P = {}> = LoadableGeneratedOptions & {
  loading?: ({
    error,
    isLoading,
    pastDelay
  }: {
    error?: Error | null;
    isLoading?: boolean;
    pastDelay?: boolean;
    timedOut?: boolean;
  }) => JSX.Element | null;
  loader?: Loader<P>;
  ssr?: boolean;
};

export type DynamicOptions<P = {}> = LoadableBaseOptions<P>;

export type LoaderFn<P = {}> = (
  opts: DynamicOptions<P>
) => React.ComponentType<P>;

export type LoadableComponent<P = {}> = React.ComponentType<P>;

export function noSSR<P = {}>(
  LoadableInitializer: LoaderFn<P>,
  dynamicOptions: DynamicOptions<P>
) {
  // Removing webpack and modules means react-loadable won't try preloading
  delete dynamicOptions.webpack;
  delete dynamicOptions.modules;

  // This check is neccesary to prevent react-loadable from initializing on the server
  if (!isServerSide) {
    console.log('11');
    return LoadableInitializer(dynamicOptions);
  }

  const Loading = dynamicOptions.loading!;
  // This will only be rendered on the server side
  return () => (
    <Loading error={null} isLoading pastDelay={false} timedOut={false} />
  );
}

export default function dynamic<P = {}>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>
): React.ComponentType<P> {
  let loadableFn: LoaderFn<P> = Loadable;
  let loadableOptions: DynamicOptions<P> = {
    // A loading component is not required, so we default it
    loading: ({ error, isLoading, pastDelay }) => {
      if (!pastDelay) return null;
      if (process.env.NODE_ENV === "development") {
        if (isLoading) {
          return null;
        }
        if (error) {
          return (
            <p>
              {error.message}
              <br />
              {error.stack}
            </p>
          );
        }
      }

      return null;
    }
  };

  if (typeof dynamicOptions === "function") {
    loadableOptions.loader = dynamicOptions;
    // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
  } else if (typeof dynamicOptions === "object") {
    loadableOptions = { ...loadableOptions, ...dynamicOptions };
  }

  // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
  loadableOptions = { ...loadableOptions, ...options };

  if (typeof loadableOptions.ssr === "boolean") {
    if (!loadableOptions.ssr) {
      delete loadableOptions.ssr;
      return noSSR(loadableFn, loadableOptions);
    }
    delete loadableOptions.ssr;
  }

  return loadableFn(loadableOptions);
}
