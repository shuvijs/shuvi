// This should be kept when pagePickLoader is true
export const loader = async ctx => {
  console.log('loader function')
}

// These should be removed and their dead code eliminated
export function unusedFunction() {
  console.log('unused function')
  const deadCode = 'this should be eliminated'
  console.log(deadCode)
}

export const unusedVar = 'unused variable'

// Dead code that should be eliminated
const deadVariable = 'dead variable'
console.log(deadVariable)

function deadFunction() {
  return 'dead function'
}

// This should be kept when pagePickLoader is false
export default function Page() {
  return 'page component'
} 