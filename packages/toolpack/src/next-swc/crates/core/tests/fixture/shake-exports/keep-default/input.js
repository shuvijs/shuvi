let shouldBeRemoved = 'should be removed';
export function removeFunction() {
  console.log(shouldBeRemoved);
}

let shouldBeKept = 'should be kept';
export default function shouldBeKept() {
  console.log(shouldBeKept);
}
