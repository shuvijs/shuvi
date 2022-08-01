import transform from '../swc-transform';

const swc = async (
  code: string,
  {
    isServer = false,
    disableShuviDynamic = false
  }: {
    isServer: boolean;
    disableShuviDynamic?: boolean;
  }
) => {
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
    isServer,
    disableShuviDynamic,
    minify: true,
    jsc
  };

  return transform(code, options)!;
};

describe('dynamic-plugin', () => {
  describe('client', () => {
    const isServer = false;
    test('should work with dynamic import', async () => {
      const output = await swc(
        `
        import { dynamic } from '@shuvi/runtime'
  
        dynamic(() => import("./component"),{})
      `,
        {
          isServer
        }
      );

      expect(output).toMatchInlineSnapshot(
        `"import{dynamic}from\\"@shuvi/runtime\\";dynamic(()=>import(\\"./component\\"),{webpack:()=>[require.resolveWeak(\\"./component\\")]})"`
      );
    });

    test('dynamic import could be disabled', async () => {
      const output = await swc(
        `
        import { dynamic } from '@shuvi/runtime'
  
        dynamic(() => import("./component"),{})
      `,
        {
          isServer,
          disableShuviDynamic: true
        }
      );

      expect(output).toMatchInlineSnapshot(
        `"import{dynamic}from\\"@shuvi/runtime\\";dynamic(()=>import(\\"./component\\"),{webpack:()=>[require.resolve(\\"./component\\")]})"`
      );
    });

    test('should work with async function', async () => {
      const output = await swc(
        `
        import React from 'react';
        import { dynamic } from '@shuvi/runtime'
  
        dynamic(async () => {
          await wait(500);
          return () => React.createElement('div', null, '123')
        }, {})
      `,
        {
          isServer
        }
      );

      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";import{dynamic}from\\"@shuvi/runtime\\";dynamic(async()=>{await wait(500);return()=>React.createElement(\\"div\\",null,\\"123\\")},{})"`
      );
    });

    test('should work with object options', async () => {
      const output = await swc(
        `
        import React from 'react';
        import { dynamic } from '@shuvi/runtime'
  
        dynamic({
          loader: () => import("./component")
        })
      `,
        {
          isServer
        }
      );
      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";import{dynamic}from\\"@shuvi/runtime\\";dynamic({loader:()=>import(\\"./component\\")},{webpack:()=>[require.resolveWeak(\\"./component\\")]})"`
      );
    });
  });

  describe('server', () => {
    const isServer = true;
    test('should work with dynamic import', async () => {
      const output = await swc(
        `
        import { dynamic } from '@shuvi/runtime'
  
        dynamic(() => import("./component"),{})
      `,
        {
          isServer
        }
      );

      expect(output).toMatchInlineSnapshot(
        `"import{dynamic}from\\"@shuvi/runtime\\";dynamic(()=>import(\\"./component\\"),{modules:[\\"./component\\"]})"`
      );
    });

    test('should work with async function', async () => {
      const output = await swc(
        `
        import React from 'react';
        import { dynamic } from '@shuvi/runtime'
  
        dynamic(async () => {
          await wait(500);
          return () => React.createElement('div', null, '123')
        }, {})
      `,
        {
          isServer
        }
      );

      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";import{dynamic}from\\"@shuvi/runtime\\";dynamic(async()=>{await wait(500);return()=>React.createElement(\\"div\\",null,\\"123\\")},{})"`
      );
    });

    test('should work with object options', async () => {
      const output = await swc(
        `
        import React from 'react';
        import { dynamic } from '@shuvi/runtime'
  
        dynamic({
          loader: () => import("./component")
        })
      `,
        {
          isServer
        }
      );
      expect(output).toMatchInlineSnapshot(
        `"import React from\\"react\\";import{dynamic}from\\"@shuvi/runtime\\";dynamic({loader:()=>import(\\"./component\\")},{modules:[\\"./component\\"]})"`
      );
    });
  });

  test('should throw error when more than 2 arguments supplied', async () => {
    let error: any;
    try {
      await swc(
        `
        import { dynamic } from '@shuvi/runtime'

        dynamic(() => import('./component'), {}, {})
      `,
        {
          isServer: false
        }
      );
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain(`only accepts 2 arguments`);
  });
});
