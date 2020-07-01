const App = () => <div>Index Page</div>;

App.getInitialProps = ({ appContext }) => {
  appContext.notFound = true;
};

export default App;
