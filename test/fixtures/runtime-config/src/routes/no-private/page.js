import { getRuntimeConfig } from '@shuvi/runtime';

function App() {
  return <div id="no-private">{getRuntimeConfig().secretA}</div>;
}

export default App;
