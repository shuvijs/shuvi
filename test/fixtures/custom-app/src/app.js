const getApp = App => {
  const MyApp = props => (
    <div>
      <div id="pathname">{props.pathname}</div>
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
  return MyApp
}


export default getApp;
