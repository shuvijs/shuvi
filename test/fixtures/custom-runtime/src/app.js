import { App } from '@shuvi/runtime';

const MyApp = props => (
  <div>
    <div id="pathname">pathname: {props.pathname}</div>
    <App />
  </div>
);

MyApp.getInitialProps = async ({ fetchInitialProps, appContext }) => {
  let pathname;
  if (appContext.req) {
    pathname = appContext.req.pathname;
  } else {
    pathname = window.location.pathname;
  }

  await fetchInitialProps();

  return {
    pathname
  };
};

export default MyApp;
