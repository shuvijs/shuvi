function App() {
  return <div>Redirect Page</div>;
}

export const loader = ctx => {
  const { query, redirect } = ctx;
  if (query) {
    if (query.code) {
      return redirect(query.code, query.target);
    } else {
      return redirect(query.target);
    }
  }
};

export default App;
