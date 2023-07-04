import { transform } from '@babel/core';
import type { PresetOptions } from '../preset';
import { trim } from 'shuvi-test-utils/shared';

const babel = (
  code: string,
  { esm, isNode }: { esm: boolean; isNode: boolean } = {
    esm: false,
    isNode: true
  },
  presetOptions: PresetOptions = {}
) =>
  transform(code, {
    filename: 'noop.js',
    presets: [[require('../preset'), presetOptions]],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true,
    caller: {
      name: 'tests',
      supportsStaticESM: esm,
      isNode
    } as any
  })!.code;

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

describe('shuvi/babel', () => {
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

    test('basic app', () => {
      const output = babel(trim(BASIC_APP), { esm: true, isNode });

      // Do not convert arrow function
      expect(output).toContain('const App=()=>{');

      // Destructure array as object
      expect(output).toContain('const{0:count,1:setCount}=useState(0);');

      // Hoist React.createElement as __jsx
      expect(output).toContain('var __jsx=React.createElement');
      expect(output).toMatch(/return __jsx\(.*?\)/);

      // Global css and css modules
      expect(output).toMatch(/import styles from"a.css\?cssmodules"/);
      expect(output).toMatch(/import'global.css'/);

      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";var __jsx=React.createElement;import{useState}from'react';import styles from\\"a.css?cssmodules\\";import'global.css';const App=()=>{const{0:count,1:setCount}=useState(0);return __jsx(\\"div\\",null,count);};export default App;"`
      );
    });

    test('basic app without esm', () => {
      const output = babel(trim(BASIC_APP), { esm: false, isNode });

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
        'const{0:count,1:setCount}=(0,_react.useState)(0);'
      );

      // Hoist React.createElement as __jsx
      expect(output).toContain('var __jsx=_react.default.createElement;');
      expect(output).toMatch(/return __jsx\(.*?\)/);

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Exports
      expect(output).toMatch(/var _default=App;exports.default=_default;$/);
    });
  });

  describe('browser', () => {
    const isNode = false;

    test('basic app', () => {
      const output = babel(trim(BASIC_APP), { esm: true, isNode });

      // Global css and css modules
      expect(output).toMatch(/import styles from"a.css\?cssmodules"/);
      expect(output).toMatch(/import'global.css'/);

      // Hoist React.createElement as __jsx
      expect(output).toContain('var __jsx=React.createElement');
      expect(output).toMatch(/return __jsx\(.*?\)/);

      // Convert arrow function to function block
      expect(output).toContain('var App=function App(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var _useState=useState(0),count=_useState[0],setCount=_useState[1]'
      );

      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";var __jsx=React.createElement;import{useState}from'react';import styles from\\"a.css?cssmodules\\";import'global.css';var App=function App(){var _useState=useState(0),count=_useState[0],setCount=_useState[1];return __jsx(\\"div\\",null,count);};export default App;"`
      );
    });

    test('basic app without esm', () => {
      const output = babel(trim(BASIC_APP), { esm: false, isNode });

      // use strict
      expect(output).toMatch(/^"use strict"/);

      // require _interopRequireDefault
      expect(output).toContain('var _interopRequireDefault=require');

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Hoist React.createElement as __jsx
      expect(output).toContain('var __jsx=_react["default"].createElement');

      // Convert arrow function to function block
      expect(output).toContain('var App=function App(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var _useState=(0,_react.useState)(0),count=_useState[0],setCount=_useState[1];'
      );

      // export default
      expect(output).toMatch(/exports\["default"\]=_default;$/);
    });
  });
});
