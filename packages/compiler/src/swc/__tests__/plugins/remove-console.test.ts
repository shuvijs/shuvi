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
    removeConsole: true,
    jsc
  };

  return transform(code, options)!;
};

describe('remove console', () => {
  it('should remove console at top level', async () => {
    const output = await swc(
      `console.log("remove console test at top level");`
    );

    expect(output).toMatchInlineSnapshot(`
      ";
      "
    `);
  });

  it('should remove console in function', async () => {
    const output = await swc(`
    export function shouldRemove() {
      console.log("remove console test in function");
      console.error("remove console test in function / error");
    }
    `);

    expect(output).toMatchInlineSnapshot(`
      "export function shouldRemove() {
          ;
          ;
      }
      "
    `);
  });
});
