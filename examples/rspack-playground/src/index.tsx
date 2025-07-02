// Use global React and ReactDOM from UMD
const React = window.React;
const { createRoot } = window.ReactDOM;

// Test CSS imports - these should be transformed by the SWC plugin
import './styles/global.css';
import './styles/component.css';
import './styles/variables.less';
import './styles/mixins.scss';
import './styles/utilities.sass';

// Named CSS imports - these should be transformed by the auto CSS modules plugin
import styles from './styles/component.css';
import lessStyles from './styles/variables.less';
import scssStyles from './styles/mixins.scss';
import sassStyles from './styles/utilities.sass';

// Enhanced CSS Modules demonstration
import moduleStyles from './styles/modules.css';

console.log('Hello, world! log');
console.error('Hello, world! error');

// Use the imported styles to verify they are transformed
console.log('CSS Modules styles:', styles);
console.log('Less styles:', lessStyles);
console.log('SCSS styles:', scssStyles);
console.log('Sass styles:', sassStyles);
console.log('Enhanced CSS Modules styles:', moduleStyles);

export * from './utils';

function App() {
  const [count, setCount] = React.useState(0);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    setCount(prev => prev - 1);
  };

  return (
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.title}>Rspack Playground</h1>
      <p className={moduleStyles.subtitle}>
        Welcome to the Rspack example with enhanced CSS Modules support!
      </p>

      <div className={moduleStyles.demoSection}>
        <h2>Counter: {count}</h2>
        <button
          className={`${moduleStyles.button} ${moduleStyles.buttonPrimary}`}
          onClick={handleIncrement}
        >
          Increment
        </button>
        <button
          className={`${moduleStyles.button} ${moduleStyles.buttonSecondary}`}
          onClick={handleDecrement}
        >
          Decrement
        </button>
      </div>

      <div className={moduleStyles.demoSection}>
        <h3>CSS Modules Demo</h3>
        <p>This demonstrates CSS Modules with scoped class names:</p>
        <div className={moduleStyles.card}>
          <h4 className={moduleStyles.cardTitle}>CSS Modules Features</h4>
          <ul className={moduleStyles.featureList}>
            <li className={moduleStyles.featureItem}>
              Automatic class name scoping
            </li>
            <li className={moduleStyles.featureItem}>No naming conflicts</li>
            <li className={moduleStyles.featureItem}>TypeScript support</li>
            <li className={moduleStyles.featureItem}>Hot reloading</li>
          </ul>
        </div>
        <button
          className={`${moduleStyles.button} ${moduleStyles.buttonSuccess}`}
        >
          CSS Modules Button
        </button>
      </div>

      <div className={moduleStyles.demoSection}>
        <h3>Style Processing Demo</h3>
        <p>This example demonstrates:</p>
        <ul className={moduleStyles.featureList}>
          <li className={moduleStyles.featureItem}>
            CSS Modules transformation
          </li>
          <li className={moduleStyles.featureItem}>Less compilation</li>
          <li className={moduleStyles.featureItem}>SCSS compilation</li>
          <li className={moduleStyles.featureItem}>Sass compilation</li>
          <li className={moduleStyles.featureItem}>
            Console log removal (except errors)
          </li>
        </ul>
      </div>

      <div className={moduleStyles.demoSection}>
        <h3>Legacy CSS Modules</h3>
        <p>Original CSS Modules (from component.css):</p>
        <button className={styles.button}>Legacy CSS Modules Button</button>
      </div>
    </div>
  );
}

// Render the app to the DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
