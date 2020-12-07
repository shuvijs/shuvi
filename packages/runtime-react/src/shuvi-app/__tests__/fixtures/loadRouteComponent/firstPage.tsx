import { Link } from '@shuvi/router-react';

const FirstPage = () => (
  <div>
    first page
    <Link to="/second">go second page</Link>
  </div>
);

FirstPage.getInitialProps = async () => {
  const data = await new Promise(resolve =>
    setTimeout(() => resolve('done'), 1000)
  );
  return {
    data
  };
};

export default FirstPage;
