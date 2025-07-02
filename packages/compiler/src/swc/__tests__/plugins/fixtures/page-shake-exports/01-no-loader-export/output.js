let shouldBeRemoved = 'should be removed';
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