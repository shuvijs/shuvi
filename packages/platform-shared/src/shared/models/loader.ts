import { defineModel } from 'doura';

export interface LoaderState {
  dataByRouteId: Record<string, any>;
}

const initState: LoaderState = {
  dataByRouteId: {}
};

export const loaderModelName = 'loader';

export const loaderModel = defineModel({
  state: initState,
  actions: {
    setDatas(newData: Record<string, any>) {
      this.dataByRouteId = {
        ...this.dataByRouteId,
        ...newData
      };
    }
  },
  views: {
    getAllData() {
      return this.dataByRouteId;
    }
  }
});

export type LoaderModel = typeof loaderModel;
