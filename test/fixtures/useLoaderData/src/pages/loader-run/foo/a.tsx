import { useLoaderData, Link, Loader } from '@shuvi/runtime';

function App() {
  const data = useLoaderData<{ path: string; time: number }>();
  return (
    <div>
      <div>this is loader-run foo a</div>
      <div data-test-id="path">{data?.path}</div>
      <div data-test-id="time-foo-a">{data?.time}</div>
      <div>
        <Link to={`/loader-run/foo/a?sssss=2222`}>Add Query Self</Link>
        <br />
        <Link to={`/loader-run/bar/a`}>Go To /bar/a</Link>
      </div>
    </div>
  );
}

let time = 0;
export const loader: Loader = async ({ pathname }) => {
  console.log('loader-run foo a');
  return {
    path: pathname,
    time: time++
  };
};

export default App;
