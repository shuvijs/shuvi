let loaderManager: LoaderManager;

function createLoaderManager() {
  const datas = new Map<string, any>();
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
    setDatas(obj: Record<string, any>) {
      for (const [id, data] of Object.entries(obj)) {
        datas.set(id, data);
      }
      subscribers.forEach(fn => fn());
    },
    // setData(id: string, data: any) {
    //   datas.set(id, data);
    //   subscribers.forEach(fn => fn());
    // },
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

export const getLoaderManager = () => {
  if (loaderManager) {
    return loaderManager;
  }

  loaderManager = createLoaderManager();
  return loaderManager;
};

export type LoaderManager = ReturnType<typeof createLoaderManager>;
