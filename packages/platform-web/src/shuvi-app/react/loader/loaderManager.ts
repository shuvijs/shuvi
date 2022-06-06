export enum LoaderStatus {
  idle,
  loading,
  fulfilled,
  rejected
}

export type LoaderResult = {
  loading: boolean;
  reloading: boolean;
  data: any;
  error: any;
  _error?: any;
};

const createLoader = (
  initialData: Partial<LoaderResult> = {
    loading: false,
    reloading: false,
    data: undefined,
    error: undefined
  },
  loaderFn: () => Promise<any>,
  skip = false
) => {
  let promise: Promise<any> | null;
  let status: LoaderStatus = LoaderStatus.idle;
  let { data, error } = initialData;
  let hasLoaded = false;
  let currentLoaderFn = loaderFn;

  const handlers = new Set<
    (status: LoaderStatus, result: LoaderResult) => void
  >();

  const load = async () => {
    if (skip) {
      return promise;
    }

    if (status === LoaderStatus.loading) {
      return promise;
    }

    status = LoaderStatus.loading;
    notify();

    promise = new Promise(resolve => {
      currentLoaderFn()
        .then(value => {
          data = value;
          error = null;
          status = LoaderStatus.fulfilled;
          notify();
          resolve(value);
        })
        .catch(e => {
          error = e;
          data = null;
          status = LoaderStatus.rejected;
          notify();
          resolve(e);
        })
        .finally(() => {
          promise = null;
          hasLoaded = true;
        });
    });

    return promise;
  };

  const getResult = () => ({
    loading: !hasLoaded && status === LoaderStatus.loading,
    reloading: hasLoaded && status === LoaderStatus.loading,
    data,
    error: error instanceof Error ? `${error.message}` : error,
    // redundant fields for ssr log
    _error: error
  });

  const notify = () => {
    handlers.forEach(handler => {
      handler(status, getResult());
    });
  };

  const onChange = (
    handler: (status: LoaderStatus, result: LoaderResult) => void
  ) => {
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
    };
  };

  const setLoaderFn = (newLoaderFn: () => Promise<any>) => {
    currentLoaderFn = newLoaderFn;
  };

  return {
    get result() {
      return getResult();
    },
    get promise() {
      return promise;
    },
    onChange,
    load,
    setLoaderFn
  };
};

/**
 * Create loaders manager. It's returned instance will add to context
 * @param initialDataMap used to initialing loader data
 */
export const createLoaderManager = (
  initialDataMap: Record<string, LoaderResult>
) => {
  const loadersMap = new Map<string, Loader>();
  const add = (loaderFn: () => Promise<any>, id: string) => {
    let loader = loadersMap.get(id);
    if (loader) {
      loader.setLoaderFn(loaderFn);
    }
    if (!loader) {
      loader = createLoader(
        typeof initialDataMap[id] !== 'undefined' ? initialDataMap[id] : {},
        loaderFn
      );
      loadersMap.set(id, loader);
    }
    return loader;
  };

  const get = (id: string) => loadersMap.get(id);

  // check if there has pending loaders
  const hasPendingLoaders = () => {
    for (const loader of loadersMap.values()) {
      const { promise } = loader;

      if (promise instanceof Promise) {
        return true;
      }
    }

    return false;
  };

  const awaitLoaders = async () => {
    const pendingLoaders = [];

    for (const [id, loader] of loadersMap) {
      const { load } = loader;
      load();
      if (loader.promise instanceof Promise) {
        pendingLoaders.push([id, loader] as [string, Loader]);
      }
    }
    await Promise.all(pendingLoaders.map(item => item[1].promise));

    return pendingLoaders.reduce<Record<string, LoaderResult>>(
      (res, [id, loader]) => {
        res[id] = loader.result;

        return res;
      },
      {}
    );
  };

  return {
    hasPendingLoaders,
    awaitLoaders,
    add,
    get
  };
};

export type Loader = ReturnType<typeof createLoader>;
export type LoaderManager = ReturnType<typeof createLoaderManager>;
