import transform from '../swc-transform';
import { trim } from 'shuvi-test-utils';

const swc = async (code: string) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
    target: 'es2021',
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

  return transform(code, options)!;
};

describe('loadable-plugin', () => {
  test('should work with dynamic import', async () => {
    const output = await swc(trim`
      import { dynamic } from '@shuvi/runtime'

      dynamic(() => import("./component"),{})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import{dynamic}from'@shuvi/runtime';dynamic(()=>import(\\"./component\\"),{webpack:()=>[require.resolveWeak(\\"./component\\")],modules:[\\"./component\\"]})"`
    );
  });

  test('should work with async function', async () => {
    const output = await swc(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/runtime'

      dynamic(async () => {
        await wait(500);
        return () => React.createElement('div', null, '123')
      }, {})
    `);

    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/runtime';dynamic(async()=>{await wait(500);return()=>React.createElement('div',null,'123')},{})"`
    );
  });

  test('should work with object options', async () => {
    const output = await swc(trim`
      import React from 'react';
      import { dynamic } from '@shuvi/runtime'

      dynamic({
        loader: () => import("./component")
      })
    `);
    expect(output).toMatchInlineSnapshot(
      `"import React from'react';import{dynamic}from'@shuvi/runtime';dynamic({loader:()=>import(\\"./component\\")},{webpack:()=>[require.resolveWeak(\\"./component\\")],modules:[\\"./component\\"]})"`
    );
  });

  test('should throw error when more than 2 arguments supplied', async () => {
    let error: any;
    try {
      await swc(trim`
        import { dynamic } from '@shuvi/runtime'

        dynamic(() => import('./component'), {}, {})
      `);
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain(`only accepts 2 arguments`);
  });
});
