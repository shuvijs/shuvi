// Complex test fixture for module replacement testing
import(
  /* webpackChunkName:"sharedOne" */
  '../shared/one?env=dev&mock=true&_lazy'
);
import(
  /* webpackChunkName:"sharedTwo" */
  '../shared/two?env=prod&_lazy'
);
import(
  /* webpackChunkName:"sharedThree" */
  '../shared/three?feature=new-ui&_lazy'
);
import(
  /* webpackChunkName:"sharedFour" */
  '../shared/four?debug=true&_lazy'
);

// Test different import patterns
import apiClient from '../shared/api?env=staging';
import logger from '../shared/logger?level=debug';
import config from '../shared/config?env=test';

// Test dynamic imports with complex queries
const loadModule = async (moduleName, options = {}) => {
  const query = new URLSearchParams(options).toString();
  return import(`../shared/${moduleName}?${query}`);
};

// Test conditional imports
if (process.env.NODE_ENV === 'development') {
  import('../shared/dev-tools?debug=true');
}

// Test multiple query parameters
import('../shared/analytics?track=true&env=prod&version=2.0');
