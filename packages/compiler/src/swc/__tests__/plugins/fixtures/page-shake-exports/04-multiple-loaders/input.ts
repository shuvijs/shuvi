export const loader = async ctx => {
  console.log('first loader')
}

export const loader2 = async ctx => {
  console.log('second loader')
}

export function otherFunction() {
  console.log('other function')
}

export default function Page() {
  return 'Page'
} 