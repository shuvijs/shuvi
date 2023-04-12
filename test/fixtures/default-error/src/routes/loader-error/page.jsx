export default function LoaderError() {
  return <div>Loader Error</div>
}

export const loader = () => {
  throw Error('Custom Loader Error')
}
