import { Link } from '@shuvi/runtime';
export default function Page() {
  return (
    <div>
      <div id="about">About Page</div>
      <div>
        <Link id="link-go-home" to="/">
          Go to /
        </Link>
      </div>
      <div>
        <Link id="link-go-list" to="/list">
          Go to /list
        </Link>
      </div>
    </div>
  );
}
