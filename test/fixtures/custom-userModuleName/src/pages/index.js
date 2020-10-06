const Index = props => <div>{props.content}</div>;

Index.getInitialProps = async () => {
  return {
    content: 'Index Page'
  };
};
export default Index;
