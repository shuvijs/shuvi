import { getRuntimeConfig } from "@shuvi/app";

function App() {
  return <div id="no-private">{getRuntimeConfig().$serverOnly}</div>;
}

export default App;
