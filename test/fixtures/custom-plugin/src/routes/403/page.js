const App = () => <div>403 Page</div>;

App.getInitialProps = ({ appContext }) => {
  appContext.forbidden = true;
};

export default App;
