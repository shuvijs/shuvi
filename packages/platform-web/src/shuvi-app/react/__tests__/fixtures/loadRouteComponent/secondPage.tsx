import * as React from 'react';
import { Link } from '@shuvi/router-react';

const SecondPage = () => (
  <div>
    second page
    <Link to="/first">go first page</Link>
  </div>
);

export default SecondPage;
