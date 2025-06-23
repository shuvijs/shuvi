// Multiple entry points fixture
console.log('Main entry point');

// Import some modules to create chunks
import(
  /* webpackChunkName: "components_header" */
  './components/header'
);
import(
  /* webpackChunkName: "components_footer" */
  './components/footer'
);
