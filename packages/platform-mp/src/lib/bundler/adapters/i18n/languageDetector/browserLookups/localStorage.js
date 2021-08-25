import Taro from '@tarojs/taro';
let hasLocalStorageSupport = null;

const localStorageAvailable = () => {
  if (hasLocalStorageSupport !== null) return hasLocalStorageSupport;

  try {
    hasLocalStorageSupport = bn !== 'undefined' && bn.getStorage !== null;
    const testKey = 'i18next.translate.boo';
    Taro.setStorageSync(testKey, 'foo');
    Taro.removeStorageSync(testKey);
  } catch (e) {
    hasLocalStorageSupport = false;
  }
  return hasLocalStorageSupport;
};

export default {
  name: 'localStorage',

  lookup(options) {
    let found;

    if (options.lookupLocalStorage && localStorageAvailable()) {
      const lng = Taro.getStorageSync(options.lookupLocalStorage);
      if (lng) found = lng;
    }

    return found;
  },

  cacheUserLanguage(lng, options) {
    if (options.lookupLocalStorage && localStorageAvailable()) {
      Taro.setStorageSync(options.lookupLocalStorage, lng);
    }
  }
};
