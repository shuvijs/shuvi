// Named exports
export const namedConst = 'named const'
export let namedLet = 'named let'
export var namedVar = 'named var'

// Function exports
export function namedFunction() {
  return 'named function'
}

export const arrowFunction = () => 'arrow function'

// Class exports
export class NamedClass {
  method() {
    return 'class method'
  }
}

// Default export
export default function DefaultComponent() {
  return 'default component'
}

// Re-exports
const internalVar = 'internal'
export { internalVar as externalVar }

// Multiple exports in one statement
const a = 'a'
const b = 'b'
export { a, b as c }

// Loader export (should be kept when pagePickLoader is true)
export const loader = async ctx => {
  console.log('loader function')
} 