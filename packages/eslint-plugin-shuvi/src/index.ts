module.exports = {
  rules: {
    'no-head-element': require('./rules/no-head-element'),
    'no-html-link-for-pages': require('./rules/no-html-link-for-pages'),
    'no-typos': require('./rules/no-typos')
  },
  configs: {
    recommended: {
      plugins: ['@shuvi/shuvi'],
      rules: {
        // warnings
        '@shuvi/shuvi/no-head-element': 'warn',
        '@shuvi/shuvi/no-typos': 'warn',
        // errors
        '@shuvi/shuvi/no-html-link-for-pages': 'error'
      }
    }
  }
};
