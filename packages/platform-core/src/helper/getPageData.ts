import { getAppData } from './getAppData';

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
