export interface Config {
  track: Function;
  debug: boolean;
  responseInterceptor(response?: any): any;
  requestInterceptor(url: string, options: object): any;
  baseUrl: string;
  accelerateOrigin: string;
  checkAccelerable: Function | null;
  accelerate: {
    defaultOrigin: string;
    origins: Array<string>;
    enbleSites: Array<string> | null;
    checkAccelerable: Function | null;
  };
}

export const config = {
  debug: false,
  responseInterceptor: (res: any) => res,
  requestInterceptor: (url: string, options: object) => [url, options],
  baseUrl: '',
  accelerateOrigin: '',
  checkAccelerable: () => false,
  accelerate: {
    defaultOrigin: '',
    origins: [],
    enbleSites: null,
    checkAccelerable: null
  }
};

export const initConfig = (cfg: { [K in keyof Config]?: Config[K] }) => {
  return Object.assign(config, cfg);
};

const LOCALE_MAP: Record<string, string> = {
  'zh-CN': 'cn',
  'zh-TW': 'tw',
  ko: 'kr',
  vi: 'vn',
  fil: 'ph',
  uk: 'ua',
  tr: 'tr',
  ru: 'ru',
  es: 'es',
  'es-419': 'es-LA',
  in: 'in',
  ro: 'ro',
  bg: 'bg',
  cs: 'cs',
  fr: 'fr',
  'fr-CA': 'fr',
  'fr-CH': 'fr',
  'fr-FR': 'fr',
  de: 'de',
  'de-DE': 'de',
  'de-CH': 'de',
  'de-AT': 'de',
  nl: 'nl',
  pt: 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  it: 'it',
  'it-CH': 'it',
  'it-IT': 'it',
  pl: 'pl',
  id: 'id',
  ja: 'ja',
  'en-AU': 'au'
};

export function getLocaleLanguage(locale: string) {
  return LOCALE_MAP[locale] || 'en';
}
