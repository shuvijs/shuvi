import { normalizeContextForSerialize } from '../../utils';

function App(props) {
  return <div data-test-id="getInitialProps">{JSON.stringify(props)}</div>;
}

App.getInitialProps = ctx => {
  return normalizeContextForSerialize(ctx);
};

export default App;
