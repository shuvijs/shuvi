/// <reference lib="dom" />
import { CLIENT_APPDATA_ID } from '@shuvi/shared/lib/constants';
import { IAppState } from '../store';

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IAppData<Data = {}> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  loadersData?: { [x: string]: any };
  appState?: IAppState;
  pageData?: {
    [key: string]: any;
  };
} & {
  [K in keyof Data]: Data[K];
};

let appData: IAppData | null = null;

export function getAppData(): IAppData {
  if (appData) {
    return appData;
  }

  const el = document.getElementById(CLIENT_APPDATA_ID);
  if (!el || !el.textContent) {
    return {
      ssr: false,
      pageData: {},
      loadersData: {}
    };
  }

  return JSON.parse(el.textContent);
}
