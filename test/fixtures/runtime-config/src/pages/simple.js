import { getRuntimeConfig } from "@shuvi/app";

function App(props) {
  return (
    <div>
      <div id="server">{props.server}</div>
      <div id="client">{getRuntimeConfig().client}</div>
    </div>
  );
}

App.getInitialProps = () => {
  return {
    server: getRuntimeConfig().server
  };
};

export default App;
