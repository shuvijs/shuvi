import { trim } from 'shuvi-test-utils';
import { transform } from '@babel/core';

function babel(code: string) {
  return transform(code, {
    filename: 'noop.js',
    plugins: [[require.resolve('../loadable-plugin')]],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true,
  })!.code;
}

describe('loadable-plugin', () => {
  test('should work with dynamic import', () => {
    const output = babel(trim`
      import { dynamic } from '@shuvi/runtime'

      dynamic(() => import("./component"),{})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import{dynamic}from'@shuvi/runtime';dynamic(()=>import(\\"./component\\"),{webpack:()=>[require.resolveWeak(\\"./component\\")],modules:[\\"./component\\"]});"`
    );
  });

  test('should work with async function', () => {
    const output = babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/runtime'

      dynamic(async () => {
        await wait(500);
        return () => React.createElement('div', null, '123')
      }, {})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/runtime';dynamic(async()=>{await wait(500);return()=>React.createElement('div',null,'123');},{});"`
    );
  });

  test('should work with object options', () => {
    const output = babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/runtime'

      dynamic({
        loader: () => import("./component")
      })
    `);
    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/runtime';dynamic({loader:()=>import(\\"./component\\"),webpack:()=>[require.resolveWeak(\\"./component\\")],modules:[\\"./component\\"]});"`
    );
  });

  test('should throw error when more than 2 arguments supplied', () => {
    expect(() =>
      babel(trim`
        import { dynamic } from '@shuvi/runtime'

        dynamic(() => import('./component'), {}, {})
      `)
    ).toThrowError(`shuvi/dynamic only accepts 2 arguments`);
  });
});
