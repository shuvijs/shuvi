const App = () => <div>404 Page</div>;

App.getInitialProps = ({ appContext }) => {
  appContext.notFound = true;
};

export default App;
