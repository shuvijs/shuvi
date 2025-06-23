// Large modules fixture
import(
  /* webpackChunkName: "large-data-module" */
  './large-data-module'
);
import(
  /* webpackChunkName: "large-utility-module" */
  './large-utility-module'
);

// Multiple large imports
for (let i = 0; i < 5; i++) {
  import(
    /* webpackChunkName: "large-modules_[request]" */
    `./large-modules/module-${i}`
  );
}
