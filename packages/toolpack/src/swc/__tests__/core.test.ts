import transform from './swc-transform';
import { trim } from 'shuvi-test-utils';

const swc = async (
  code: string,
  { esm, isNode }: { esm: boolean; isNode: boolean }
) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
    parser: {
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      dynamicImport: false,
      // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true
    },

    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development,
        useBuiltins: true,
        refresh: false
      }
    }
  };

  const options = {
    disableShuviDynamic: false,
    minify: true,
    jsc
  };

  if (isNode) {
    // @ts-ignore
    options.env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    (jsc as typeof jsc & { target: string }).target = 'es5';
  }
  if (!esm) {
    // @ts-ignore
    options.module = {
      type: 'commonjs'
    };
  }
  return transform(code, options)!;
};

const BASIC_APP = `
  import { useState } from 'react';
  import styles from 'a.css';
  import 'global.css';

  const App = () => {
      const [count, setCount] = useState(0);
      return <div>{count}</div>
  }

  export default App;
`;

describe('shuvi/swc', () => {
  const NODE_ENV = process.env.NODE_ENV;
  beforeEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.resetModules();
    // @ts-ignore
    process.env.NODE_ENV = NODE_ENV;
  });

  describe('node', () => {
    const isNode = true;

    test('basic app', async () => {
      const output = await swc(trim(BASIC_APP), { esm: true, isNode });

      // Do not convert arrow function
      expect(output).toContain('const App=()=>{');

      // Destructure array as object
      expect(output).toContain('const{0:count,1:setCount}=useState(0);');

      // import _jsx
      expect(output).toContain('import{jsx as _jsx}from"react/jsx-runtime"');
      expect(output).toMatch(/return _jsx\(.*?\)/);

      // Global css and css modules
      expect(output).toMatch(/import styles from'a.css\?cssmodules'/);
      expect(output).toMatch(/import'global.css'/);

      expect(output).toMatchInlineSnapshot(
        `"import{jsx as _jsx}from\\"react/jsx-runtime\\";import{useState}from'react';import styles from'a.css?cssmodules';import'global.css';const App=()=>{const{0:count,1:setCount}=useState(0);return _jsx(\\"div\\",{children:count})};export default App"`
      );
    });

    test('basic app without esm', async () => {
      const output = await swc(trim(BASIC_APP), { esm: false, isNode });

      // use strict
      expect(output).toMatch(/^"use strict"/);

      // require _interopRequireDefault
      expect(output).toContain('function _interopRequireDefault');

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Do not convert arrow function
      expect(output).toContain('const App=()=>{');

      // Destructure array as object
      expect(output).toContain(
        'const{0:count,1:setCount}=(0,_react).useState(0);'
      );

      // require _jsx
      expect(output).toContain('var _jsxRuntime=require("react/jsx-runtime")');
      expect(output).toMatch(/return\(0,_jsxRuntime\)\.jsx\(.*?\)/);

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Exports
      expect(output).toMatch(/var _default=App;exports.default=_default$/);
    });
  });

  describe('browser', () => {
    const isNode = false;

    test('basic app', async () => {
      const output = await swc(trim(BASIC_APP), { esm: true, isNode });

      // Global css and css modules
      expect(output).toMatch(/import styles from'a.css\?cssmodules'/);
      expect(output).toMatch(/import'global.css'/);

      // import _jsx
      expect(output).toContain('import{jsx as _jsx}from"react/jsx-runtime"');
      expect(output).toMatch(/return _jsx\(.*?\)/);

      // Convert arrow function to function block
      expect(output).toContain('var App=function(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var ref=useState(0),count=ref[0],setCount=ref[1]'
      );

      expect(output).toMatchInlineSnapshot(
        `"import{jsx as _jsx}from\\"react/jsx-runtime\\";import{useState}from'react';import styles from'a.css?cssmodules';import'global.css';var App=function(){var ref=useState(0),count=ref[0],setCount=ref[1];return _jsx(\\"div\\",{children:count})};export default App"`
      );
    });

    test('basic app without esm', async () => {
      const output = await swc(trim(BASIC_APP), { esm: false, isNode });

      // use strict
      expect(output).toMatch(/^"use strict"/);

      // require _interopRequireDefault
      expect(output).toContain('_interopRequireDefault(require(');

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // require _jsx
      expect(output).toContain('var _jsxRuntime=require("react/jsx-runtime")');

      // Convert arrow function to function block
      expect(output).toContain('var App=function(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var ref=(0,_react).useState(0),count=ref[0],setCount=ref[1];'
      );

      // export default
      expect(output).toMatch(/exports\.default=_default$/);
    });
  });
});
