import { CLIENT_APPDATA_ID } from "../../shared/constants";

export function getAppData() {
  const el = document.getElementById(CLIENT_APPDATA_ID);
  if (!el || !el.textContent) {
    return {};
  }

  return JSON.parse(el.textContent);
}
