import { CLIENT_APPDATA_ID } from "@shuvi/shared/lib/constants";

export function getAppData() {
  const el = document.getElementById(CLIENT_APPDATA_ID);
  if (!el || !el.textContent) {
    return {};
  }

  return JSON.parse(el.textContent);
}
