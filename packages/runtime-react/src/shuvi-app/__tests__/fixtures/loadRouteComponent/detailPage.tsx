import React from 'react';
import { Link, useParams } from '@shuvi/router-react';

const DetailPage = () => {
  const params = useParams();

  return (
    <div>
      detail {params.id}
      <Link to="/detail/2">to 2</Link>
    </div>
  );
};

DetailPage.getInitialProps = async (props: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    data: props.params
  };
};

export default DetailPage;
