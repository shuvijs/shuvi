import { useParams, Link } from '@shuvi/runtime';

export default function Page() {
  const { lng } = useParams();
  return (
    <div>
      <div id="lng">{lng}</div>
      <Link to="">Go to /</Link>
    </div>
  );
}
