import { Link } from '@shuvi/app';
export default function ErrorPage({ error }) {
  return error ? (
    <div id="custom-500">500</div>
  ) : (
    <div id="custom-404">404</div>
  );
}
