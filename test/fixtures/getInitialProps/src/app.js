import { App } from '@shuvi/app';
import { normalizeContextForSerialize } from './utils';

const MyApp = props => (
  <div>
    <div data-test-id="app">{JSON.stringify(props)}</div>
    <App />
  </div>
);

MyApp.getInitialProps = async ctx => {
  await ctx.fetchInitialProps();
  return normalizeContextForSerialize(ctx);
};

export default MyApp;
