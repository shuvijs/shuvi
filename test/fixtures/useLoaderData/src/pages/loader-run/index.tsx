import { RouterView, Link, useLoaderData, Loader } from '@shuvi/runtime';

function App() {
  const data = useLoaderData<{ time: number }>();
  return (
    <div>
      <div>This is loader-run</div>
      <div data-test-id="time-loader-run">{data?.time}</div>
      <div>
        <Link to={'/loader-run/foo/a'}>To /loader-run/foo/a</Link>
      </div>
      <RouterView />
    </div>
  );
}

let time = 0;
export const loader: Loader = () => {
  console.log('loader-run');
  return {
    time: time++
  };
};

export default App;
