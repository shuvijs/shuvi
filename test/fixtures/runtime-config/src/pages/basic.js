import { getRuntimeConfig } from '@shuvi/runtime';
import NoSSR from '../components/no-ssr';

function App(props) {
  return (
    <div>
      <div id="server-a">{props.a}</div>
      <div id="server-b">{props.b}</div>
      <NoSSR />
    </div>
  );
}

App.getInitialProps = () => {
  const runtimeConfig = getRuntimeConfig();
  return {
    a: runtimeConfig.a,
    b: runtimeConfig.b
  };
};

export default App;
