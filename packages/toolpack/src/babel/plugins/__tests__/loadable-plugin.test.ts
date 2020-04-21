import { trim } from 'test-utils';
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
      import { dynamic } from '@shuvi/app'

      dynamic(async () => import("./component"),{})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import{dynamic}from'@shuvi/app';dynamic(async()=>import(\\"./component\\"),{webpack:()=>[require.resolveWeak(\\"./component\\")],modules:[\\"./component\\"]});"`
    );
  });

  test('should work with async function', () => {
    const output = babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/app'

      dynamic(async () => {
        await wait(500); 
        return () => React.createElement('div', null,'123')
      } ,{})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/app';dynamic(async()=>{await wait(500);return()=>React.createElement('div',null,'123');},{});"`
    );
  });

  test('should throw error when empty object supplied', () => {
    expect(() =>
      babel(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/app'

      dynamic({})
    `)
    ).toThrowError("Cannot read property 'traverse' of undefined");
  });

  test('should throw error when more than 2 arguments supplied', () => {
    expect(() =>
      babel(trim`
        import { dynamic } from '@shuvi/app'

        dynamic(async () => () => 'sample',{},{})
      `)
    ).toThrowError(`shuvi/dynamic only accepts 2 arguments`);
  });
});
