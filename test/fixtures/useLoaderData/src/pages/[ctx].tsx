import { normalizeContextForSerialize } from '../utils';

function App(props) {
  return <div data-test-id="ctx">{JSON.stringify(props)}</div>;
}

export const loader = ctx => {
  return normalizeContextForSerialize(ctx);
};

export default App;
