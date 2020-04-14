import { App } from '@shuvi/app';

const MyApp = (props) => (
  <div>
    <div id="pathname">{props.pathname}</div>
    <App />
  </div>
);

MyApp.getInitialProps = (ctx) => {
  let pathname;
  if (ctx.req) {
    pathname = ctx.req.url.pathname;
  } else {
    pathname = window.location.pathname;
  }

  return {
    pathname,
  };
};

export default MyApp;
