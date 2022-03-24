export default function Index(props) {
  return <div>Index Page: {props.index}</div>;
}
Index.getInitialProps = function () {
  return {
    index: 'index props'
  };
};
