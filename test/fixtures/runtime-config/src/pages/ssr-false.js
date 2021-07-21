import getRuntimeConfig from '@shuvi/app/services/getRuntimeConfig';

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
