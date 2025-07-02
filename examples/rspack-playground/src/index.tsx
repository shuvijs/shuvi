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

console.log('Hello, world! log');
console.error('Hello, world! error');

// Use the imported styles to verify they are transformed
console.log('CSS Modules styles:', styles);
console.log('Less styles:', lessStyles);
console.log('SCSS styles:', scssStyles);
console.log('Sass styles:', sassStyles);

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
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Rspack Playground</h1>
      <p>Welcome to the Rspack example with SWC plugins!</p>

      <div style={{ margin: '2rem 0' }}>
        <h2>Counter: {count}</h2>
        <button
          className={styles.button}
          onClick={handleIncrement}
          style={{ marginRight: '1rem' }}
        >
          Increment
        </button>
        <button className={styles.button} onClick={handleDecrement}>
          Decrement
        </button>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3>CSS Modules Demo</h3>
        <p>This button uses CSS modules (check console for style object):</p>
        <button className={styles.button}>CSS Modules Button</button>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3>Style Processing Demo</h3>
        <p>This example demonstrates:</p>
        <ul>
          <li>CSS Modules transformation</li>
          <li>Less compilation</li>
          <li>SCSS compilation</li>
          <li>Sass compilation</li>
          <li>Console log removal (except errors)</li>
        </ul>
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
