const App = () => <div id="index">Index Page</div>;

App.getInitialProps = ctx => {
  ctx.error(501, 'Something wrong');
};

export default App;
