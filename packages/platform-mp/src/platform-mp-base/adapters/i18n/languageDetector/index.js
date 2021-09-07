import * as utils from './utils.js';
import querystring from './browserLookups/querystring.js';
import localStorage from './browserLookups/localStorage.js';

function getDefaults() {
  return {
    order: ['querystring', 'localStorage'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',
    lookupSessionStorage: 'i18nextLng',

    // cache user language
    caches: ['localStorage'],
    excludeCacheFor: ['cimode']
    //cookieMinutes: 10,
    //cookieDomain: 'myDomain'
  };
}

class Browser {
  constructor(services, options = {}) {
    this.type = 'languageDetector';
    this.detectors = {};
    this.async = true;
    this.init(services, options);
  }

  init(services, options = {}, i18nOptions = {}) {
    this.services = services;
    this.options = utils.defaults(options, this.options || {}, getDefaults());

    // backwards compatibility
    if (this.options.lookupFromUrlIndex)
      this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex;

    this.i18nOptions = i18nOptions;

    this.addDetector(querystring);
    this.addDetector(localStorage);
  }

  addDetector(detector) {
    this.detectors[detector.name] = detector;
  }

  detect(callback) {
    bn.getSystemInfo().then(info => {
      callback(info.language);
    });
  }

  cacheUserLanguage(lng, caches) {
    if (!caches) caches = this.options.caches;
    if (!caches) return;
    if (
      this.options.excludeCacheFor &&
      this.options.excludeCacheFor.indexOf(lng) > -1
    )
      return;
    caches.forEach(cacheName => {
      if (this.detectors[cacheName])
        this.detectors[cacheName].cacheUserLanguage(lng, this.options);
    });
  }
}

Browser.type = 'languageDetector';

export default Browser;
