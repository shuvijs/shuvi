import { getRuntimeConfig } from '@shuvi/app';
import NoSSR from '../components/no-ssr';

function App(props) {
  return (
    <div>
      <div id="server">{props.server}</div>
      <NoSSR />
    </div>
  );
}

App.getInitialProps = () => {
  return {
    server: getRuntimeConfig().server
  };
};

export default App;
