// Special characters fixture
import(
  /* webpackChunkName: "modules_with-spaces" */
  './modules/with spaces'
);
import(
  /* webpackChunkName: "modules_with-dashes" */
  './modules/with-dashes'
);
import(
  /* webpackChunkName: "modules_with_underscores" */
  './modules/with_underscores'
);
import(
  /* webpackChunkName: "modules_with.dots" */
  './modules/with.dots'
);

// Dynamic imports with special characters
const moduleName = 'special-chars-module';
import(
  /* webpackChunkName: "modules_special-chars" */
  `./modules/${moduleName}`
);
