import helloStyles from './hello.css'
import helloStyles2 from './hello.scss'
import helloStyles3 from './hello.sass'

export function hello(): string {
  console.log(helloStyles.hello)
  console.log(helloStyles2.hello)
  console.log(helloStyles3.hello)
  return 'Hello'
}
