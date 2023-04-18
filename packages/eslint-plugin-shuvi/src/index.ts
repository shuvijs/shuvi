module.exports = {
  rules: {
    'no-head-element': require('./rules/no-head-element').default,
    'no-html-link-for-pages': require('./rules/no-html-link-for-pages').default,
    'no-typos': require('./rules/no-typos').default
  },
  configs: {
    recommended: {
      rules: {
        // warnings
        '@shuvi/shuvi/no-head-element': 'warn',
        '@shuvi/shuvi/no-typos': 'error',
        // errors
        '@shuvi/shuvi/no-html-link-for-pages': 'error'
      }
    }
  }
};
