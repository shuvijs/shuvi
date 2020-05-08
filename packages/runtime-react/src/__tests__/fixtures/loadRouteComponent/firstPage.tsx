import React from 'react';

const FirstPage = () => <div>first page</div>;

FirstPage.getInitialProps = async () => {
  const data = await new Promise((resolve) =>
    setTimeout(() => resolve('done'), 1000)
  );
  return {
    data,
  };
};

export default FirstPage;
