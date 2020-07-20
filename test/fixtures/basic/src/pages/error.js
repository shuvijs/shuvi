const ErrorPage = () => {
  return <div id="shouldNotRender">error page</div>;
};

ErrorPage.getInitialProps = () => {
  throw new Error('sample error');
};

export default ErrorPage;
