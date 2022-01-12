import { getRuntimeConfig } from "@shuvi/runtime";

function App() {
  return <div id="no-private">{getRuntimeConfig().$serverOnly}</div>;
}

export default App;
