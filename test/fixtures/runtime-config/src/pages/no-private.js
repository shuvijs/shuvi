import getRuntimeConfig from '@shuvi/services/getRuntimeConfig';

function App() {
  return <div id="no-private">{getRuntimeConfig().$serverOnly}</div>;
}

export default App;
