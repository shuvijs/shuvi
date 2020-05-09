function App(props) {
  return <div data-test-id="req">{JSON.stringify(props)}</div>;
}

App.getInitialProps = ({ req }) => {
  const { headers, url, parsedUrl } = req;

  return {
    headers,
    url,
    parsedUrl
  };
};

export default App;
