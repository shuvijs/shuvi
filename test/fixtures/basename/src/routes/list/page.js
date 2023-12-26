import { Link } from '@shuvi/runtime';
export default function Page() {
  return (
    <div>
      <div id="list">List Page</div>
      <div>
        <Link id="link-go-about" to="/about">
          Go to /about
        </Link>
      </div>
    </div>
  );
}
