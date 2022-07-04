let loaderManager: LoaderManager;

function createLoaderManager(initDatas: Record<string, any>) {
  const datas = new Map<string, any>(Object.entries(initDatas));
  const subscribers: Function[] = [];

  return {
    getAllData() {
      let res: Record<string, any> = {};
      for (const [id, data] of datas.entries()) {
        res[id] = data;
      }
      return res;
    },
    getData(id: string) {
      if (!datas.has(id)) {
        return null;
      }

      return datas.get(id);
    },
    setData(id: string, data: any) {
      datas.set(id, data);
      subscribers.forEach(subscriber => subscriber());
    },
    subscribe(cb: Function) {
      subscribers.push(cb);

      return () => {
        const index = subscribers.indexOf(cb);
        if (index >= 0) {
          subscribers.splice(index, 1);
        }
      };
    },
    clearAllData() {
      datas.clear();
    }
  };
}

export const getLoaderManager = (initialDataMap?: Record<string, any>) => {
  if (loaderManager) {
    return loaderManager;
  }

  loaderManager = createLoaderManager(initialDataMap || {});
  return loaderManager;
};

export type LoaderManager = ReturnType<typeof createLoaderManager>;
