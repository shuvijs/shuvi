import { App } from '@shuvi/app';

const MyApp = (props) => (
  <div>
    <div id="pathname">{props.pathname}</div>
    <App />
  </div>
);

MyApp.getInitialProps = async ({ fetchInitialProps, appContext }) => {
  let pathname;
  if (appContext.req) {
    pathname = appContext.req.parsedUrl.pathname;
  } else {
    pathname = window.location.pathname;
  }

  await fetchInitialProps();

  return {
    pathname,
  };
};

export default MyApp;
