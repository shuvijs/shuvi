import { App } from '@shuvi/app';

const MyApp = (props) => (
  <div>
    <div id="pathname">{props.pathname}</div>
    <App />
  </div>
);

MyApp.getInitialProps = async (ctx) => {
  let pathname;
  if (ctx.req) {
    pathname = ctx.req.parsedUrl.pathname;
  } else {
    pathname = window.location.pathname;
  }

  await ctx.fetchInitialProps();

  return {
    pathname,
  };
};

export default MyApp;
