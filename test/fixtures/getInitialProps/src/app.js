import { App } from '@shuvi/runtime';
import { normalizeContextForSerialize } from './utils';

const MyApp = props => (
  <div>
    <div data-test-id="app">{JSON.stringify(props)}</div>
    <App />
  </div>
);

MyApp.getInitialProps = async ctx => {
  await ctx.fetchInitialProps();
  console.log('ctx', ctx);
  return normalizeContextForSerialize(ctx);
};

export default MyApp;
