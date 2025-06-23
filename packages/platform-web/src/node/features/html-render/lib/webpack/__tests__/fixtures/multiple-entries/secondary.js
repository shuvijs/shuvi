// Secondary entry point
console.log('Secondary entry point');

// Import different modules
import(
  /* webpackChunkName: "utils_helper" */
  './utils/helper'
);
import(
  /* webpackChunkName: "utils_validator" */
  './utils/validator'
);
