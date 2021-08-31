import md5 from 'md5';
import { fetch } from '../fetch';
import { getCookie } from '../cookieLib';
import { config, getLocaleLanguage } from './init';
const isClient = !!(typeof window !== 'undefined' && window.document);

// TODO: 删除
const isHybrid = false;

const { warn } = console;

// 删除 logRecord
// 删除 _record
// 删除 unfetch & bridge && fetch
// 删除 getDeviceInfo
// 删除 checkStatus
// 自己模拟 uuidv4
// 删除 logUrl & logQueue
// 删除 getPage
// const { debug, responseInterceptor, requestInterceptor } = config; 关于这里删除了debug 的 log，responseInterceptor，requestInterceptor
// 删除 fetchPonyfill
// 删除 fetchOrigin

interface Options {
  omitHeader?: boolean;
  lang?: string;
  headers?: {
    [key: string]: any;
  };
  req?: Req;
  credentials?: string;
  request?: Req;
}

interface Req {
  url: string;
  headers: {
    [key: string]: any;
  };
}

interface RequestOptions {
  mode: string;
  method: string;
  headers: Object;
  page?: string;
  credentials?: string;
}

// uuidv4
function _uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// const getBncUUID = () => {
//   if (!isClient) return ''
//   let bncuuid = getCookie('bnc-uuid')
//   if (!bncuuid) {
//     bncuuid = _uuid()
//     setCookie({
//       name: 'bnc-uuid',
//       value: bncuuid,
//       expires: 365 * 5,
//     })
//   }
//   return bncuuid
// }
let systemLanguage: string;
// const bncUUID = getBncUUID();
const getLang = async (): Promise<String> => {
  if (systemLanguage) return systemLanguage;
  try {
    const { language } = await bn.getSystemInfo();
    systemLanguage = getLocaleLanguage(language);
  } catch (e) {
    systemLanguage = 'en';
  }
  return systemLanguage;
};

const getNodeCookieHeader = (req?: Req) => {
  if (isClient) return {};
  const cookie = (req && req.headers && req.headers.cookie) || null;
  return cookie ? { cookie } : {};
};

const generateHeader = async (uuid: string, options: Options) => {
  const { omitHeader, lang, headers, req, credentials } = options;
  let defaultHeader = omitHeader
    ? {}
    : {
        lang: lang || (await getLang()),
        'X-UI-REQUEST-TRACE': uuid,
        'X-TRACE-ID': uuid,
        // "BNC-UUID": bncUUID,
        'Content-Type': 'application/json'
        // ...deviceInfo,
      };
  if (!omitHeader && !isHybrid) {
    // defaultHeader = Object.assign(defaultHeader, { clienttype: "web" });
  }
  const cookieHeader = getNodeCookieHeader(req);
  // const page = getPage(request || req);
  let opts: RequestOptions = {
    method: 'GET',
    mode: 'cors',
    headers: { ...defaultHeader, ...cookieHeader, ...headers },
    credentials
  };
  return {
    opts,
    page: 'TODO'
  };
};

const addAuthHeader = (options: any) => {
  if (typeof window === 'undefined') return options;
  const csrftoken = getCookie('cr00');
  options.headers = options.headers || {};
  if (!options.headers.csrftoken) {
    options.headers.csrftoken = md5(csrftoken || '');
  }
  return options;
};

const generateUrl = (url: string) => {
  let {
    baseUrl,
    accelerateOrigin,
    checkAccelerable,
    accelerate: accelerateConfig
  } = config;

  /* Downward compatibility start */
  checkAccelerable = accelerateConfig.checkAccelerable || checkAccelerable;
  if (isClient) {
    const { enbleSites } = accelerateConfig;
    accelerateOrigin =
      (window as any)._ACCELERATE_ORIGIN ||
      accelerateConfig.defaultOrigin ||
      accelerateOrigin;
    if (typeof accelerateOrigin === 'string') {
      accelerateOrigin = protocol(accelerateOrigin);
    }
    if (enbleSites && isArray(enbleSites)) {
      accelerateOrigin = '';
    }
  }

  /* Downward compatibility end */

  if (/^(https?:)?\/\//.test(url)) return url;
  if (
    isClient &&
    !isHybrid &&
    accelerateOrigin &&
    typeof accelerateOrigin === 'string' &&
    /^(https?:)?\/\//.test(accelerateOrigin) &&
    checkAccelerable &&
    checkAccelerable()
  ) {
    return `${accelerateOrigin}${url}`;
  }
  if (baseUrl) return `${baseUrl}${url}`;
  if (isClient) return `${window.location.origin}${url}`;
  return url;
};

const request = async (url: string, opts: any, params?: any, page?: string) => {
  let res;
  try {
    url = generateUrl(url);
    res = await fetch(url, opts);

    const { _bodyBlob } = res;
    if (_bodyBlob && _bodyBlob.type === 'application/vnd.ms-excel') {
      return res.blob();
    }
    const result = await res.json();
    return result;
  } catch (err) {
    warn(err);
    warn(params);
    warn(page);
    throw err;
  }
};

export const get = async (url: string, options: Options) => {
  options = options || {};

  const uuid = _uuid();
  const { opts, page } = await generateHeader(uuid, addAuthHeader(options));

  return request(url, opts, {}, page);
};

export const post = async (url: string, params: any, options: Options = {}) => {
  const uuid = _uuid();
  let { opts, page } = await generateHeader(uuid, addAuthHeader(options));
  opts = Object.assign(opts, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  return request(url, opts, params, page);
};

export const put = async (url: string, params: any, options: Options = {}) => {
  const uuid = _uuid();

  let { opts, page } = await generateHeader(uuid, addAuthHeader(options));
  opts = Object.assign(opts, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  return request(url, opts, params, page);
};

export const postForm = async (
  url: string,
  params: any,
  options: Options = {}
) => {
  const uuid = _uuid();
  let { opts, page } = await generateHeader(uuid, addAuthHeader(options));

  delete opts.headers['Content-Type'];
  opts = Object.assign(opts, {
    method: 'POST',
    body: params
  });
  return request(url, opts, params, page);
};

function isArray(arr: any) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

function protocol(domain: string) {
  if (!domain) return domain;
  if (/^https?:/.test(domain)) return domain;
  return `https://${domain}`;
}

declare var bn: any;

export function fetchOrigin() {
  return {
    fetch: (url: string, options: any = {}) => {
      return bn.request({
        url,
        ...options
      });
    }
  };
}
