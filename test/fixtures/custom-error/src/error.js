export default function ErrorPage({ notFound }) {
  return notFound ? (
    <div id="custom-404">404</div>
  ) : (
    <div id="custom-500">500</div>
  );
}

ErrorPage.getInitialProps = ({ error }) => {
  return { notFound: !error };
};
