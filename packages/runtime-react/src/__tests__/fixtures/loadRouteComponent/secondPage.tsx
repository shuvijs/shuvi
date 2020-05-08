import React from 'react';
import { Link } from 'react-router-dom';

const SecondPage = () => (
  <div>
    second page
    <Link to="/first">go first page</Link>
  </div>
);

export default SecondPage;
