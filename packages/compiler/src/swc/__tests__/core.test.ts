import transform from './swc-transform';

const swc = async (
  code: string,
  {
    esm = true,
    isNode = false,
    filename = 'noop.js'
  }: { esm?: boolean; isNode?: boolean; filename?: string } = {}
) => {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
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
      },
      optimizer: {
        simplify: false,
        globals: {
          typeofs: {
            window: isNode ? 'undefined' : 'object'
          }
        }
      }
    }
  };

  const options = {
    disableShuviDynamic: false,
    minify: true,
    jsc
  };

  if (isNode) {
    // @ts-ignore
    options.env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    (jsc as typeof jsc & { target: string }).target = 'es5';
  }
  if (!esm) {
    // @ts-ignore
    options.module = {
      type: 'commonjs'
    };
  }
  return transform(code, options)!;
};

const BASIC_APP = `
  import { useState } from 'react';
  import styles from 'a.css';
  import 'global.css';

  const App = () => {
      const [count, setCount] = useState(0);
      return <div>{count}</div>
  }

  export default App;
`;

describe('swc/core', () => {
  const NODE_ENV = process.env.NODE_ENV;
  beforeEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.resetModules();
    // @ts-ignore
    process.env.NODE_ENV = NODE_ENV;
  });

  describe('node', () => {
    const isNode = true;

    test('basic app', async () => {
      const output = await swc(BASIC_APP, { esm: true, isNode });

      // Do not convert arrow function
      expect(output).toContain('const App=()=>{');

      // Destructure array as object
      expect(output).toContain('const{0:count,1:setCount}=useState(0);');

      // import _jsx
      expect(output).toContain('import{jsx as _jsx}from"react/jsx-runtime"');
      expect(output).toMatch(/return _jsx\(.*?\)/);

      // Global css and css modules
      expect(output).toMatch(/import styles from\"a\.css\?cssmodules\"/);
      expect(output).toMatch(/import\"global\.css\"/);

      expect(output).toMatchInlineSnapshot(
        `"import{jsx as _jsx}from\\"react/jsx-runtime\\";import{useState}from\\"react\\";import styles from\\"a.css?cssmodules\\";import\\"global.css\\";const App=()=>{const{0:count,1:setCount}=useState(0);return _jsx(\\"div\\",{children:count})};export default App"`
      );
    });

    test('basic app without esm', async () => {
      const output = await swc(BASIC_APP, { esm: false, isNode });

      // use strict
      expect(output).toMatch(/^"use strict"/);

      // require _interopRequireDefault
      expect(output).toContain('function _interopRequireDefault');

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Do not convert arrow function
      expect(output).toContain('const App=()=>{');

      // Destructure array as object
      expect(output).toContain(
        'const{0:count,1:setCount}=(0,_react.useState)(0);'
      );

      // require _jsx
      expect(output).toContain(
        'const _jsxRuntime=require("react/jsx-runtime");'
      );
      expect(output).toMatch(/return\(0,_jsxRuntime\.jsx\)\(.*/);

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // Exports
      expect(output).toMatch(/var _default=App$/);
    });

    describe('replace constants', () => {
      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window !== 'undefined';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(
          `"\\"undefined\\"!==\\"undefined\\""`
        );
      });

      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window !== 'object';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(`"\\"undefined\\"!==\\"object\\""`);
      });
    });
  });

  describe('browser', () => {
    const isNode = false;

    test('basic app', async () => {
      const output = await swc(BASIC_APP, { esm: true, isNode });

      // Global css and css modules
      expect(output).toMatch(/import styles from\"a\.css\?cssmodules\"/);
      expect(output).toMatch(/import\"global\.css\"/);

      // import _jsx
      expect(output).toContain('import{jsx as _jsx}from"react/jsx-runtime"');
      expect(output).toMatch(/return _jsx\(.*?\)/);

      // Convert arrow function to function block
      expect(output).toContain('var App=function(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var ref=useState(0),count=ref[0],setCount=ref[1]'
      );

      expect(output).toMatchInlineSnapshot(
        `"import{jsx as _jsx}from\\"react/jsx-runtime\\";import{useState}from\\"react\\";import styles from\\"a.css?cssmodules\\";import\\"global.css\\";var App=function(){var ref=useState(0),count=ref[0],setCount=ref[1];return _jsx(\\"div\\",{children:count})};export default App"`
      );
    });

    test('basic app without esm', async () => {
      const output = await swc(BASIC_APP, { esm: false, isNode });

      // use strict
      expect(output).toMatch(/^"use strict"/);

      // require _interopRequireDefault
      expect(output).toContain('_interopRequireDefault(require(');

      // Global css and css modules
      expect(output).toContain('require("global.css");');
      expect(output).toContain('require("a.css?cssmodules")');

      // require _jsx
      expect(output).toContain('var _jsxRuntime=require("react/jsx-runtime")');

      // Convert arrow function to function block
      expect(output).toContain('var App=function(){');

      // Array to Object destructure and map array to individual variable
      expect(output).toContain(
        'var ref=(0,_react.useState)(0),count=ref[0],setCount=ref[1]'
      );

      // export default
      expect(output).toMatch(/var _default=App$/);
    });

    describe('replace constants', () => {
      test('should replace typeof window expression nested', async () => {
        const code = await swc('function a(){console.log(typeof window)}', {
          isNode
        });
        expect(code).toMatchInlineSnapshot(
          `"function a(){console.log(\\"object\\")}"`
        );
      });

      test('should replace typeof window expression nested', async () => {
        const code = await swc(
          `function a(){console.log(typeof window === 'undefined')}`,
          { isNode }
        );
        expect(code).toMatchInlineSnapshot(
          `"function a(){console.log(\\"object\\"===\\"undefined\\")}"`
        );
      });

      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window === 'undefined';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(`"\\"object\\"===\\"undefined\\""`);
      });

      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window === 'object';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(`"\\"object\\"===\\"object\\""`);
      });

      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window !== 'undefined';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(`"\\"object\\"!==\\"undefined\\""`);
      });

      test('should replace typeof window expression top level', async () => {
        const code = await swc(`typeof window !== 'object';`, {
          isNode
        });
        expect(code).toMatchInlineSnapshot(`"\\"object\\"!==\\"object\\""`);
      });
    });
  });

  describe('syntax', () => {
    test('should support exportDefaultFrom', async () => {
      const code = await swc(`export { default as foo } from "bar"`);
      expect(code).toMatchInlineSnapshot(
        `"export{default as foo}from\\"bar\\""`
      );
    });

    test('should not drop unused exports by default', async () => {
      const code = await swc(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";` +
          // complex
          `import * as React from "react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";`
      );
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{foo,bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import baz2,{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee,f as ff}from\\"f\\""`
      );
    });

    const pageFile = 'pages/index.js';
    const tsPageFile = pageFile.replace(/\.js$/, '.ts');

    test('should not drop unused exports by default in a page', async () => {
      const code = await swc(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";`,
        { filename: pageFile }
      );
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{foo,bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import baz2,{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee,f as ff}from\\"f\\""`
      );
    });

    test('should support optional chaining for JS file', async () => {
      const code = await swc(
        `let hello;` +
          `export default () => hello?.world ? 'something' : 'nothing' `,
        {
          filename: pageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default function(){return(hello===null||hello===void 0?void 0:hello.world)?\\"something\\":\\"nothing\\"}"`
      );
    });

    test('should support optional chaining for TS file', async () => {
      const code = await swc(
        `let hello;` +
          `export default () => hello?.world ? 'something' : 'nothing' `,
        {
          filename: tsPageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default function(){return(hello===null||hello===void 0?void 0:hello.world)?\\"something\\":\\"nothing\\"}"`
      );
    });

    test('should support nullish coalescing for JS file', async () => {
      const code = await swc(
        `const res = {
          status: 0,
          nullVal: null,
          statusText: '',
  
        }
        const status = res.status ?? 999
        const nullVal = res.nullVal ?? 'another'
        const statusText = res.nullVal ?? 'not found'
        export default () => 'hello'
        `,
        {
          filename: pageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var res={status:0,nullVal:null,statusText:\\"\\"};var _status;var status=(_status=res.status)!==null&&_status!==void 0?_status:999;var _nullVal;var nullVal=(_nullVal=res.nullVal)!==null&&_nullVal!==void 0?_nullVal:\\"another\\";var _nullVal1;var statusText=(_nullVal1=res.nullVal)!==null&&_nullVal1!==void 0?_nullVal1:\\"not found\\";export default function(){return\\"hello\\"}"`
      );
    });

    test('should support nullish coalescing for TS file', async () => {
      const code = await swc(
        `const res = {
          status: 0,
          nullVal: null,
          statusText: '',
  
        }
        const status = res.status ?? 999
        const nullVal = res.nullVal ?? 'another'
        const statusText = res.nullVal ?? 'not found'
        export default () => 'hello'
        `,
        {
          filename: tsPageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var res={status:0,nullVal:null,statusText:\\"\\"};var _status;var status=(_status=res.status)!==null&&_status!==void 0?_status:999;var _nullVal;var nullVal=(_nullVal=res.nullVal)!==null&&_nullVal!==void 0?_nullVal:\\"another\\";var _nullVal1;var statusText=(_nullVal1=res.nullVal)!==null&&_nullVal1!==void 0?_nullVal1:\\"not found\\";export default function(){return\\"hello\\"}"`
      );
    });
  });

  test('should support custom plugin', async () => {
    const swc = async (code: string, swcPlugins: any[] = []) => {
      const plugins = (swcPlugins ?? [])
        .filter(Array.isArray)
        .map(([name, options]) => [require.resolve(name), options]);

      const jsc = {
        experimental: {
          plugins
        }
      };

      const options = {
        jsc
      };

      return transform(code, options)!;
    };
    const output = await swc(
      `import { Grid, Row, Col as Col1 } from 'react-bootstrap';`,
      [
        [
          '@swc/plugin-transform-imports',
          {
            'react-bootstrap': {
              transform: 'react-bootstrap/lib/{{member}}'
            }
          }
        ]
      ]
    );

    expect(output).toMatchInlineSnapshot(`
      "import Grid from \\"react-bootstrap/lib/Grid\\";
      import Row from \\"react-bootstrap/lib/Row\\";
      import Col1 from \\"react-bootstrap/lib/Col\\";
      "
    `);
  });
});
