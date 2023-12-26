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
        <Link to="/en">Go to /en</Link>
      </div>
      <div>
        <button onClick={goToAbout}>Go to /about</button>
      </div>
    </div>
  );
}
