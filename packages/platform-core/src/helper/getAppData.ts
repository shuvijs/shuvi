/// <reference lib="dom" />

import { Runtime } from '@shuvi/service';
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
      pageData: {}
    };
  }

  return JSON.parse(el.textContent);
}
