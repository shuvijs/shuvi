import transform from '../swc-transform';

const swc = async (code: string) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
    target: 'es5',
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

describe('jsx-pragma', () => {
  it('should transform JSX to use a local identifier', async () => {
    const output = await swc(`const a = () => <a href="/">home</a>;`);

    // it should import _jsx
    expect(output).toMatch(`import{jsx as _jsx}from\"react/jsx-runtime\"`);
    // it should use that factory for all JSX:
    expect(output).toMatch(`_jsx(\"a\",{href:\"`);

    expect(output).toMatchInlineSnapshot(
      `"import{jsx as _jsx}from\\"react/jsx-runtime\\";var a=function(){return _jsx(\\"a\\",{href:\\"/\\",children:\\"home\\"})}"`
    );
  });

  it('should support Fragment syntax', async () => {
    const output = await swc(`const a = () => <>hello</>;`);

    expect(output).toMatch(
      `import{jsx as _jsx,Fragment as _Fragment}from\"react/jsx-runtime\"`
    );

    expect(output).toMatchInlineSnapshot(
      `"import{jsx as _jsx,Fragment as _Fragment}from\\"react/jsx-runtime\\";var a=function(){return _jsx(_Fragment,{children:\\"hello\\"})}"`
    );
  });

  it('should support commonjs', async () => {
    const output = await swc(
      `
        const React = require('react');
        module.exports = () => <div>test2</div>;
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"\\"use strict\\";Object.defineProperty(exports,\\"__esModule\\",{value:true});var _jsxRuntime=require(\\"react/jsx-runtime\\");var React=require(\\"react\\");module.exports=function(){return(0,_jsxRuntime.jsx)(\\"div\\",{children:\\"test2\\"})}"`
    );
  });
});
