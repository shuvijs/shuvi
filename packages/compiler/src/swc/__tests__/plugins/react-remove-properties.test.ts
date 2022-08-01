import transform from '../swc-transform';

const swc = async (code: string, properties: string[] = []) => {
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
  console.log('properties: ', properties);

  const options = {
    reactRemoveProperties: { properties },
    jsc
  };

  return transform(code, options)!;
};

describe('react remove properties', () => {
  const str = `
  export default function Home() {
    return <div data-test-id="1" data-custom="1a">
      <div data-custom="2">
        <h1 data-testid="3" nested={() => (<div data-testid="4">nested</div>)}>Hello World!</h1>
      </div>
    </div>
  }`;

  it('should remove ^data-test properties by default', async () => {
    const output = await swc(str);

    expect(output).toMatchInlineSnapshot(`
      "import { jsx as _jsx } from \\"react/jsx-runtime\\";
      export default function Home() {
          return /*#__PURE__*/ _jsx(\\"div\\", {
              \\"data-custom\\": \\"1a\\",
              children: /*#__PURE__*/ _jsx(\\"div\\", {
                  \\"data-custom\\": \\"2\\",
                  children: /*#__PURE__*/ _jsx(\\"h1\\", {
                      nested: function() {
                          return /*#__PURE__*/ _jsx(\\"div\\", {
                              children: \\"nested\\"
                          });
                      },
                      children: \\"Hello World!\\"
                  })
              })
          });
      };
      "
    `);
  });

  it('could support custom the properties', async () => {
    const output = await swc(str, ['^data-custom']);

    expect(output).toMatchInlineSnapshot(`
      "import { jsx as _jsx } from \\"react/jsx-runtime\\";
      export default function Home() {
          return /*#__PURE__*/ _jsx(\\"div\\", {
              \\"data-test-id\\": \\"1\\",
              children: /*#__PURE__*/ _jsx(\\"div\\", {
                  children: /*#__PURE__*/ _jsx(\\"h1\\", {
                      \\"data-testid\\": \\"3\\",
                      nested: function() {
                          return /*#__PURE__*/ _jsx(\\"div\\", {
                              \\"data-testid\\": \\"4\\",
                              children: \\"nested\\"
                          });
                      },
                      children: \\"Hello World!\\"
                  })
              })
          });
      };
      "
    `);
  });
});
