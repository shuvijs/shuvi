import { Link, useRouter } from '@shuvi/runtime';
export default function Page() {
  const router = useRouter();
  const goToAbout = () => {
    router.push('/about');
  };
  return (
    <div>
      <div id="index">Index Page</div>
      <div>
        <Link id="link-go-about" to="/about">
          Go to /about
        </Link>
      </div>
      <div>
        <Link id="link-go-list" to="/list">
          Go to /list
        </Link>
      </div>
      <div>
        <button id="button-go-about" onClick={goToAbout}>
          Go to /about
        </button>
      </div>
    </div>
  );
}

export const loader = ctx => {
  return {};
};
