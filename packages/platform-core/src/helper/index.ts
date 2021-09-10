/// <reference lib="dom" />

import { Runtime } from '@shuvi/types';
import { CLIENT_APPDATA_ID } from '@shuvi/shared/lib/constants';

let appData: Runtime.IAppData | null = null;

export function getAppData(): Runtime.IAppData {
  if (appData) {
    return appData;
  }

  const el = document.getElementById(CLIENT_APPDATA_ID);
  if (!el || !el.textContent) {
    return {
      ssr: false,
      pageData: {},
      router: {
        history: 'auto'
      }
    };
  }

  return JSON.parse(el.textContent);
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function getPageData<T = unknown>(key: string, defaultValue?: T) {
  if (typeof window === 'undefined') {
    console.warn('"getPageData" should only be called on client-side');
    return defaultValue;
  }

  const { pageData = {} } = getAppData();

  if (!hasOwnProperty.call(pageData, key)) {
    return defaultValue;
  }

  return pageData[key];
}
