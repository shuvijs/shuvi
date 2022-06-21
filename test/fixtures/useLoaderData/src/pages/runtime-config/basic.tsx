import { getRuntimeConfig, Loader, useLoaderData } from '@shuvi/runtime';

function App() {
  const data = useLoaderData<any>();

  return (
    <div>
      <div id="a">{data.a}</div>
      <div id="b">{data.b}</div>
    </div>
  );
}

export const loader: Loader = () => {
  const runtimeConfig = getRuntimeConfig();

  return {
    a: runtimeConfig.a,
    b: runtimeConfig.b
  };
};

export default App;
