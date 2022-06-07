import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

type LoaderComponent<P = {}> = Promise<
  React.ComponentType<P> | { default: React.ComponentType<P> }
>;

type Loader<P = {}> = () => LoaderComponent<P>;

type LoadableGeneratedOptions = {
  webpack?(): string[];
  modules?: string[];
};

type LoadableBaseOptions<P = {}> = LoadableGeneratedOptions & {
  loading: React.ComponentType<any>;
  loader?: Loader<P>;
  ssr?: boolean;
};

type DynamicOptions<P = {}> = LoadableBaseOptions<P>;

function resolve(obj: any) {
  return obj && obj.__esModule ? obj.default : obj;
}

function render(loaded: any, props: any) {
  return React.createElement(resolve(loaded), props);
}

function loadableFn<P = {}>(
  { loader, loading: Loading }: LoadableBaseOptions<P>,
  props: { [key: string]: any }
) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const loadedRef = useRef<unknown>(null);
  useEffect(() => {
    const runLoader = async () => {
      try {
        loadedRef.current = await loader!();
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    runLoader();
  }, []);
  return isLoading ? <Loading /> : render(loadedRef.current as any, props);
}

export default function dynamic<P = {}>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>
): (props: any) => JSX.Element | undefined {
  let loadableOptions: DynamicOptions<P> = {
    // A loading component is not required, so we default it
    loading: () => {
      return null;
    }
  };

  if (typeof dynamicOptions === 'function') {
    loadableOptions.loader = dynamicOptions;
    // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
  } else if (typeof dynamicOptions === 'object') {
    loadableOptions = { ...loadableOptions, ...dynamicOptions };
  }

  // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
  loadableOptions = { ...loadableOptions, ...options };

  return props => loadableFn(loadableOptions, props);
}
