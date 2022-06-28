/// <reference lib="dom" />
import { CLIENT_APPDATA_ID } from '@shuvi/shared/lib/constants';

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IAppData<Data = {}, appState = any> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  pageData?: {
    [key: string]: any;
  };
  routeProps?: { [x: string]: any };
  loadersData?: { [x: string]: any };
  appState?: appState;
  clientManifestPath: Record<string, string[]>;
  publicPathFromAppData: string;
} & {
  [K in keyof Data]: Data[K];
};

let appData: IAppData | null = null;

export function getAppData(): IAppData {
  if (appData) {
    return appData;
  }

  if (typeof window === 'undefined') {
    return {
      ssr: false,
      clientManifestPath: {},
      publicPathFromAppData: ''
    };
  }

  const el = document.getElementById(CLIENT_APPDATA_ID);
  if (!el || !el.textContent) {
    return {
      ssr: false,
      pageData: {},
      loadersData: {},
      clientManifestPath: {},
      publicPathFromAppData: ''
    };
  }

  return JSON.parse(el.textContent);
}
