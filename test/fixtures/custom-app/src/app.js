import { App } from "@shuvi/app";

const MyApp = props => (
  <div>
    <div id="pathname">{props.pathname}</div>
    <App />
  </div>
);

MyApp.getInitialProps = ctx => {
  return {
    pathname: ctx.req.url.pathname
  };
};

export { MyApp as App };
