import fs from 'fs';
import './side-effects';
var a = [];
console.log('![a] =>', a);
a.forEach(b => console.log(b));
window.c = 'test';
export default function Home() {
  return __jsx('div', null);
}
