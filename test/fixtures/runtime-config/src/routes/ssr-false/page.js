import { getRuntimeConfig } from '@shuvi/runtime';

const runtimeConfig = getRuntimeConfig();

function App() {
  return (
    <div>
      <div id="a">{runtimeConfig.a}</div>
      <div id="b">{runtimeConfig.b}</div>
    </div>
  );
}

export default App;
