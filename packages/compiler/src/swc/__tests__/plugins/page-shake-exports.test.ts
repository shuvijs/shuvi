import transform from '../swc-transform';

const swc = async (code: string, just_keep_loader: boolean = false) => {
  const jsc = {
    target: 'es2021'
  };

  const options = {
    isPageFile: true,
    shuviPageLoader: just_keep_loader,
    jsc
  };

  return transform(code, options)!;
};

describe('page shake exports', () => {
  const code = `
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
    }
  `;

  it('should keep no loader export', async () => {
    const output = await swc(code);

    expect(output).toMatchInlineSnapshot(`
      "let shouldBeRemoved = 'should be removed';
      export function removeFunction() {
          console.log(shouldBeRemoved);
      }
      export let removeVarDeclaration = 'should be removed';
      export let removeVarDeclarationUndefined // should also be removed
      ;
      export let multipleDecl = 'should be removed';
      export class RemoveClass {
          remove() {
              console.log('should be removed');
          }
      }
      let x = 'x';
      let y = 'y';
      // This should be removed
      export { x, y as z };
      let asKeep = 'should be kept';
      let removeNamed = 'should be removed';
      export { asKeep as keep4, removeNamed };
      export default function Page() {
          console.log('should be not be remove');
      };
      "
    `);
  });

  it('should keep loader export', async () => {
    const output = await swc(code, true);

    expect(output).toMatchInlineSnapshot(`
      "let shouldBeKept = 'should be kept';
      export const loader = async (ctx)=>{
          console.log(shouldBeKept);
      };
      "
    `);
  });
});
