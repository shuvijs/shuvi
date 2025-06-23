// CSS modules fixture
import './styles.css';
import './components.css';

// Dynamic imports with CSS
import(
  /* webpackChunkName: "dynamic-styles" */
  './dynamic-styles.css'
);

console.log('CSS modules loaded');
