function fn() {
  fn = function () {};
  return fn.apply(this, arguments);
}
export function loader() {
  fn;
}
export default function Home() {
  return <div />;
}
