import { trim } from 'shuvi-test-utils';
import { transform } from '@babel/core';

function babel(code: string) {
  return transform(code, {
    filename: 'noop.js',
    plugins: [[require.resolve('../import-to-require')]],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true
  })!.code;
}

describe('import-to-require-plugin', () => {
  test('should work with dynamic import', () => {
    const output = babel(trim`
      import { dynamic } from '@shuvi/app';
      import './a'

      dynamic(() => import("./component"),{});
      dynamic(() => import('../components/hello').then((mod) => mod.Hello),{});
    `);

    expect(output).toMatchInlineSnapshot(
      `"import{dynamic}from'@shuvi/app';import'./a';dynamic(()=>Promise.resolve(require(\\"./component\\")),{});dynamic(()=>Promise.resolve(require('../components/hello')).then(mod=>mod.Hello),{});"`
    );
  });

  test('should work with async function', () => {
    const output = babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/app'

      dynamic(async () => {
        await wait(500);
        return () => React.createElement('div', null, '123')
      }, {})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/app';dynamic(async()=>{await wait(500);return()=>React.createElement('div',null,'123');},{});"`
    );
  });

  test('should work with object options', () => {
    const output = babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/app'

      dynamic({
        loader: () => import("./component")
      })
    `);
    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/app';dynamic({loader:()=>Promise.resolve(require(\\"./component\\"))});"`
    );
  });
});
