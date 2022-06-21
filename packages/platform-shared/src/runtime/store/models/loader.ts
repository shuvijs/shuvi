import { defineModel } from '@shuvi/redox';

export interface LoaderItem {
  data: any;
  loading: boolean;
  error: boolean;
}

export type LoaderStatus = 'idle' | 'loading' | 'done';

export interface LoadersState {
  status: LoaderStatus;
  loadersById: Record<string, LoaderItem>;
}

const initState: LoadersState = {
  status: 'idle',
  loadersById: {}
};

export const loaderModel = defineModel({
  name: 'loader',
  state: initState,
  reducers: {
    hydrate(state, data: Record<string, LoaderItem>) {
      return {
        ...state,
        loadersById: {
          ...state.loadersById,
          ...data
        }
      };
    },
    loading(state, ids: string[]) {
      let obj: Record<string, LoaderItem> = {};
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        obj[id] = {
          ...obj[id],
          loading: true,
          error: false
        };
      }

      return {
        ...state,
        status: 'loading',
        loadersById: {
          ...state.loadersById,
          ...obj
        }
      };
    },
    success(state, items: { id: string; data: any }[]) {
      let obj: Record<string, LoaderItem> = {};
      for (let index = 0; index < items.length; index++) {
        const { id, data } = items[index];
        obj[id] = {
          ...obj[id],
          data,
          loading: false,
          error: false
        };
      }

      return {
        ...state,
        status: 'done',
        loadersById: {
          ...state.loadersById,
          ...obj
        }
      };
    },
    fail(state, ids: string[]) {
      let obj: Record<string, LoaderItem> = {};
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        obj[id] = {
          ...obj[id],
          data: null,
          loading: false,
          error: true
        };
      }

      return {
        ...state,
        status: 'done',
        loadersById: {
          ...state.loadersById,
          ...obj
        }
      };
    }
  }
});
