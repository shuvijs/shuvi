import { normalizeContextForSerialize } from './utils';

const getApp = App => {
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
  return MyApp
}

export default getApp;
