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

export * from 'react';
