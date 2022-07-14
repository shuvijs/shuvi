// avoid generating __source annotations in JSX during testing:
const NODE_ENV = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
import loader from '../shuvi-swc-loader';
process.env.NODE_ENV = NODE_ENV;

const os = require('os');
const path = require('path');

const dir = path.resolve(os.tmpdir());

const swc = async (
  code,
  { isNode = false, resourcePath = 'index.js' } = {}
) => {
  let isAsync = false;
  return new Promise((resolve, reject) => {
    function callback(err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    }

    const res = loader.bind({
      resourcePath,
      async() {
        isAsync = true;
        return callback;
      },
      callback,
      getOptions: function () {
        return {
          isNode,
          minify: true
        };
      }
    })(code, null);

    if (!isAsync) {
      resolve(res);
    }
  });
};

describe('shuvi-swc-loader', () => {
  describe('replace constants', () => {
    test('should replace typeof window expression nested', async () => {
      const code = await swc('function a(){console.log(typeof window)}');
      expect(code).toMatchInlineSnapshot(
        `"function a(){console.log(\\"object\\")}"`
      );
    });

    test('should replace typeof window expression top level (client)', async () => {
      const code = await swc('typeof window;');
      expect(code).toMatchInlineSnapshot(`"\\"object\\""`);
    });

    test('should replace typeof window expression top level (server)', async () => {
      const code = await swc('typeof window;', { isNode: true });
      expect(code).toMatchInlineSnapshot(`"\\"undefined\\""`);
    });

    test('should replace typeof window expression nested', async () => {
      const code = await swc(
        `function a(){console.log(typeof window === 'undefined')}`
      );
      expect(code).toMatchInlineSnapshot(
        `"function a(){console.log(\\"object\\"==='undefined')}"`
      );
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window === 'undefined';`);
      expect(code).toMatchInlineSnapshot(`"\\"object\\"==='undefined'"`);
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window === 'object';`);
      expect(code).toMatchInlineSnapshot(`"\\"object\\"==='object'"`);
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window !== 'undefined';`);
      expect(code).toMatchInlineSnapshot(`"\\"object\\"!=='undefined'"`);
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window !== 'object';`);
      expect(code).toMatchInlineSnapshot(`"\\"object\\"!=='object'"`);
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window !== 'undefined';`, {
        isNode: true
      });
      expect(code).toMatchInlineSnapshot(`"\\"undefined\\"!=='undefined'"`);
    });

    test('should replace typeof window expression top level', async () => {
      const code = await swc(`typeof window !== 'object';`, {
        isNode: true
      });
      expect(code).toMatchInlineSnapshot(`"\\"undefined\\"!=='object'"`);
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

    const pageFile = path.resolve(dir, 'pages', 'index.js');
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
        { resourcePath: pageFile }
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
          resourcePath: pageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default function(){return(hello===null||hello===void 0?void 0:hello.world)?'something':'nothing'}"`
      );
    });

    test('should support optional chaining for TS file', async () => {
      const code = await swc(
        `let hello;` +
          `export default () => hello?.world ? 'something' : 'nothing' `,
        {
          resourcePath: tsPageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default function(){return(hello===null||hello===void 0?void 0:hello.world)?'something':'nothing'}"`
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
          resourcePath: pageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var res={status:0,nullVal:null,statusText:''};var _status;var status=(_status=res.status)!==null&&_status!==void 0?_status:999;var _nullVal;var nullVal=(_nullVal=res.nullVal)!==null&&_nullVal!==void 0?_nullVal:'another';var _nullVal1;var statusText=(_nullVal1=res.nullVal)!==null&&_nullVal1!==void 0?_nullVal1:'not found';export default function(){return'hello'}"`
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
          resourcePath: tsPageFile
        }
      );
      expect(code).toMatchInlineSnapshot(
        `"var res={status:0,nullVal:null,statusText:''};var _status;var status=(_status=res.status)!==null&&_status!==void 0?_status:999;var _nullVal;var nullVal=(_nullVal=res.nullVal)!==null&&_nullVal!==void 0?_nullVal:'another';var _nullVal1;var statusText=(_nullVal1=res.nullVal)!==null&&_nullVal1!==void 0?_nullVal1:'not found';export default function(){return'hello'}"`
      );
    });
  });
});
