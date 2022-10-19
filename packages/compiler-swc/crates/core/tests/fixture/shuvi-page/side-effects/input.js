import fs from 'fs';
import other from 'other';

import './side-effects';

var a = [];
console.log('![a] =>', a);
a.forEach(b => console.log(b));
window.c = 'test';

const { p } = other;

export async function loader() {
  p;
}

export default function Home() {
  return <div />;
}
