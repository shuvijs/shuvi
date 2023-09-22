import { Link } from '@shuvi/runtime';

export default function Home() {
  return (
    <div>
      <div id="index">Home Page</div>
      <div>
        <Link to="/normal-page">to normal page</Link>
      </div>
      <div>
        <Link to="/render-error">to render-error</Link>
      </div>
      <div>
        <Link to="/loader-error-unexpectedError">
          to loader-error-unexpectedError
        </Link>
      </div>
      <div>
        <Link to="/loader-error-userError">to loader-error-userError</Link>
      </div>
      <div>
        <Link to="/loader-redirect-to-normal-page">
          to loader-redirect-to-normal-page
        </Link>
      </div>
    </div>
  );
}

export const loader = () => null;
