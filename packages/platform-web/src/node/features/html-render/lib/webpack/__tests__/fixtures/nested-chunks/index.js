// Nested chunks fixture
import(
  /* webpackChunkName: "level1_level2_level3_deep-module" */
  './level1/level2/level3/deep-module'
);

// Multiple levels of nesting
import(
  /* webpackChunkName: "level1_module1" */
  './level1/module1'
).then(module1 => {
  import(
    /* webpackChunkName: "level1_level2_module2" */
    './level1/level2/module2'
  );
});

// Conditional imports
if (process.env.NODE_ENV === 'development') {
  import(
    /* webpackChunkName: "dev-tools" */
    './dev-tools'
  );
}
