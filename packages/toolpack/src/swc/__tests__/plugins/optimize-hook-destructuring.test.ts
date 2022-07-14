import transform from '../swc-transform';
import { trim } from 'shuvi-test-utils';

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

describe('optimize-hook-destructuring', () => {
  it('should transform Array-destructured hook return values use object destructuring', async () => {
    const output = await swc(
      trim`
        import { useState } from 'react';
        const [count, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"import{useState}from'react';var ref=useState(0),count=ref[0],setCount=ref[1]"`
    );
  });

  it('should be able to ignore some Array-destructured hook return values', async () => {
    const output = await swc(
      trim`
        import { useState } from 'react';
        const [, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"import{useState}from'react';var ref=useState(0),setCount=ref[1]"`
    );
  });
});
