const ThrowError = () => {
  return 'should not render';
};

ThrowError.getInitialProps = () => {
  throw new Error('error');
};
