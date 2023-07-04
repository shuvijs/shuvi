import { transform } from '@babel/core';
import { trim } from 'shuvi-test-utils/shared';

function babel(code: string) {
  return transform(code, {
    filename: 'noop.js',
    presets: [
      [
        require('@babel/preset-react'),
        {
          pragma: '__jsx'
        }
      ]
    ],
    plugins: [
      [
        require.resolve('../jsx-pragma.ts'),
        {
          module: 'react',
          importAs: 'React',
          pragma: '__jsx',
          property: 'createElement'
        }
      ]
    ],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true
  })!.code;
}

describe('jsx-pragma', () => {
  it('should transform JSX to use a local identifier', () => {
    const output = babel(`const a = () => <a href="/">home</a>;`);

    // it should add a React import:
    expect(output).toMatch(`import React from"react"`);
    // it should hoist JSX factory to a module level variable:
    expect(output).toMatch(`var __jsx=React.createElement`);
    // it should use that factory for all JSX:
    expect(output).toMatch(`__jsx("a",{href:"/"`);

    expect(babel(`const a = ()=><a href="/">home</a>`)).toMatchInlineSnapshot(
      `"import React from\\"react\\";var __jsx=React.createElement;const a=()=>__jsx(\\"a\\",{href:\\"/\\"},\\"home\\");"`
    );
  });

  it('should support Fragment syntax', () => {
    const output = babel(`const a = () => <>hello</>;`);

    expect(output).toMatch(`React.Fragment`);

    expect(babel(`const a = () => <>hello</>;`)).toMatchInlineSnapshot(
      `"import React from\\"react\\";var __jsx=React.createElement;const a=()=>__jsx(React.Fragment,null,\\"hello\\");"`
    );
  });

  it('should support commonjs', () => {
    const output = babel(
      trim`
        const React = require('react');
        module.exports = () => <div>test2</div>;
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"const React=require('react');var __jsx=React.createElement;module.exports=()=>__jsx(\\"div\\",null,\\"test2\\");"`
    );
  });
});
