let loaderContent = 'should be kept'
export const loader = async function () {
  console.log(loaderContent);
};
export const shouldBeRemoveStr = 'test'

let shouldBeRemoved = 'should be removed'
export default function shouldBeRemove() {
  console.log(shouldBeRemove)
}