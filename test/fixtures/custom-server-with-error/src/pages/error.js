const App = () => <div id="error">Error Page</div>;

App.getInitialProps = ctx => {
  ctx.error(500, 'Something other wrong');
};

export default App;
