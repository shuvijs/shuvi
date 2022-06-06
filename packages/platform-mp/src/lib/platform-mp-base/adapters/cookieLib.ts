import Taro from '@tarojs/taro';

// TODO: isExpired
function isExpired(_expires: any) {
  return false;
}

function isObject(param: any) {
  if (
    (typeof param === 'object' || typeof param === 'function') &&
    param !== null
  ) {
    return true;
  }
  return false;
}

export function getCookie(name = '') {
  const cookies = Taro.getStorageSync('cookies'); // try/catch 略过
  const { value, expires } = cookies[name] || {};

  return name && expires && !isExpired(expires)
    ? decodeURIComponent(value)
    : '';
}

function getStandardCookieItem(_cookie: any) {
  return _cookie;
}

function saveCookiesToStorage(_cookies: any) {
  try {
    Taro.setStorageSync('cookies', _cookies);
  } catch (e) {
    // noop
  }
}

export function setCookieFromHeader(setCookieStr: string) {
  const setCookieList = (setCookieStr || '').split(';');

  for (let i = 0; i < setCookieList.length; i++) {
    const ckTrim = (setCookieList[i] || '').trim();
    // startWith
    const [key, value] = ckTrim.split('=');
    let oldCookies = Taro.getStorageSync('cookies'); // try/catch 略过

    if (key && value) {
      saveCookiesToStorage({ ...oldCookies, key: value });
    }
  }
}

export function getCookiesStr() {
  const cookies = Taro.getStorageSync('cookies'); // try/catch 略过
  const keys = Object.keys(cookies);
  const result = keys.reduce((result, curr) => {
    return `${result}${curr}=${JSON.stringify(cookies[curr])};`;
  }, '');
  return result;
}

export function setCookie(cookiesParam: any) {
  const oldCookies = Taro.getStorageSync('cookies'); // try/catch 略过
  const newCookies = {}; // 由 cookiesParam 转化为标准格式后的cookies

  for (let name in cookiesParam) {
    if (isObject(cookiesParam[name])) {
      // 传入是Object格式
      let { value, expires, maxAge } = cookiesParam[name];
      // 转换为标准cookie格式（cookieItem）
      newCookies[name] = getStandardCookieItem({
        name,
        value,
        expires,
        maxAge
      });
    } else {
      newCookies[name] = getStandardCookieItem({
        name,
        value: cookiesParam[name]
      });
    }
  }

  // 同步到本地Storage
  saveCookiesToStorage({ ...oldCookies, ...newCookies });
}

export function removeCookie(cookieName: string) {
  let cookies = Taro.getStorageSync('cookies'); // try/catch 略过

  delete cookies[cookieName];

  saveCookiesToStorage(Object.assign({}, cookies));
}

const TaroCookieLib = {
  getCookie,
  setCookie,
  removeCookie,
  setCookieFromHeader,
  getCookiesStr
};

export default TaroCookieLib;
