function App() {
  return <div>Redirect Page</div>;
}

App.getInitialProps = (ctx) => {
  const { query, redirect } = ctx;
  if (query) {
    if (query.code) {
      redirect(query.code, query.target);
    } else {
      redirect(query.target);
    }
  }
};

export default App;
