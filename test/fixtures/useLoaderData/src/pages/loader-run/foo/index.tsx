import { RouterView, useLoaderData, Loader } from '@shuvi/runtime';

function App() {
  const data = useLoaderData<{ foo: string; time: number }>();
  return (
    <div>
      <div>This is /loader-run/foo</div>
      <div data-test-id="param">{data?.foo}</div>
      <div data-test-id="time-foo">{data?.time}</div>
      <RouterView />
    </div>
  );
}

let time = 0;

export const loader: Loader = async ({ params }) => {
  console.log('loader-run foo');
  return {
    foo: params.foo,
    time: time++
  };
};

export default App;
