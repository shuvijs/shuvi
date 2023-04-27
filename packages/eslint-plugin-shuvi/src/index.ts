module.exports = {
  rules: {
    'no-head-element': require('./rules/no-head-element').default,
    'no-html-link-for-pages': require('./rules/no-html-link-for-pages').default,
    'no-typos-page': require('./rules/no-typos-page').default,
    'no-typos-custom-app': require('./rules/no-typos-custom-app').default,
    'no-typos-custom-server': require('./rules/no-typos-custom-server').default
  },
  configs: {
    recommended: {
      rules: {
        // warnings
        '@shuvi/shuvi/no-head-element': 'warn',
        // errors
        '@shuvi/shuvi/no-typos-page': 'error',
        '@shuvi/shuvi/no-typos-custom-app': 'error',
        '@shuvi/shuvi/no-typos-custom-server': 'error',
        '@shuvi/shuvi/no-html-link-for-pages': 'error'
      }
    }
  }
};
