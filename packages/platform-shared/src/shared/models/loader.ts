import { defineModel } from '@shuvi/redox';

export interface LoaderState {
  dataByRouteId: Record<string, any>;
}

const initState: LoaderState = {
  dataByRouteId: {}
};

export const loaderModel = defineModel({
  name: 'loader',
  state: initState,
  reducers: {
    setDatas(state, newData: Record<string, any>) {
      return {
        ...state,
        dataByRouteId: {
          ...state.dataByRouteId,
          ...newData
        }
      };
    }
    // clearDatas(state) {
    //   return {
    //     ...state,
    //     dataByRouteId: {}
    //   };
    // }
  },
  views: {
    getAllData() {
      return this.dataByRouteId;
    }
  }
});

export type LoaderModel = typeof loaderModel;
