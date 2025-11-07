import React from 'react';
import { Link } from '@shuvi/runtime';

const Index = () => {
  return (
    <div id="view">
      <div style={{ marginTop: '150vh' }}>
        <Link id="with-prefetch" to="/foo">
          with prefetch
        </Link>
      </div>
      <div>
        <Link id="without-prefetch" to="/bar" prefetch={false}>
          without prefetch (hover prefetch enabled)
        </Link>
      </div>
      <div>
        <Link id="no-prefetch" to="/baz" prefetch="none">
          no prefetch at all
        </Link>
      </div>
    </div>
  );
};

export default Index;
