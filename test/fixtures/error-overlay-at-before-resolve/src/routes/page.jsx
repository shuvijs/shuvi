import { Link, useLoaderData } from '@shuvi/runtime';
export default function Index() {
  const data = useLoaderData()
  return (
    <div>
      <div>
        <Link to="/a">Go to /a</Link>
        <div>{data.hello}</div>
      </div>
    </div>
  );
}

export const loader = () => {
  return {
    hello: 'world'
  }
}
