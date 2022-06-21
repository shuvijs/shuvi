import { getRuntimeConfig } from '@shuvi/runtime';
import NoSSR from '../components/no-ssr';

function App() {
  const runtimeConfig = getRuntimeConfig();

  return (
    <div>
      <div id="server-a">{runtimeConfig.a}</div>
      <div id="server-b">{runtimeConfig.b}</div>
      <NoSSR />
    </div>
  );
}

export default App;
