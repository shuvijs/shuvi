import transform from '../swc-transform';
import { trim } from 'shuvi-test-utils';

const swc = async (code: string, ignore: string[] = []) => {
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
    shakeExports: { ignore },
    disableShuviDynamic: false,
    minify: true,
    jsc
  };

  return transform(code, options)!;
};

describe('shake exports', () => {
  it('should transform JSX to use a local identifier', async () => {
    const output = await swc(
      `
    let shouldBeKept = 'should be kept'
    export const loader = async ctx => {
      console.log(shouldBeKept)
    }
    
    let shouldBeRemoved = 'should be removed'
    export function removeFunction() {
      console.log(shouldBeRemoved);
    }
    
    export let removeVarDeclaration = 'should be removed'
    export let removeVarDeclarationUndefined // should also be removed
    export let multipleDecl = 'should be removed'
    
    export class RemoveClass {
      remove() {
        console.log('should be removed')
      }
    }
    
    let x = 'x'
    let y = 'y'
    
    // This should be removed
    export {x, y as z}
    
    let asKeep = 'should be kept'
    let removeNamed = 'should be removed'
    
    export {asKeep as keep4, removeNamed}
    
    export default function Page() {
      console.log('should be not be remove')
    }`,
      ['loader', 'default']
    );

    expect(output).toMatchInlineSnapshot(
      `"let shouldBeKept=\\"should be kept\\";export const loader=async ctx=>{console.log(shouldBeKept)};export default function Page(){console.log(\\"should be not be remove\\")}"`
    );
  });
});
