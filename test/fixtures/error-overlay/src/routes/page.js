import React from 'react';
import { Link } from '@shuvi/runtime';

export default function Home() {
  return (
    <div id="home-page">
      <h1>Error Overlay Test Page</h1>
      <nav>
        <ul>
          <li>
            <Link to="/runtime-error/sync">Sync Runtime Error</Link>
          </li>
          <li>
            <Link to="/runtime-error/async">Async Runtime Error</Link>
          </li>
          <li>
            <Link to="/runtime-error/promise">Promise Rejection Error</Link>
          </li>
          <li>
            <Link to="/runtime-error/component">Component Error</Link>
          </li>
          <li>
            <Link to="/build-error">Build Error Test</Link>
          </li>
          <li>
            <Link to="/syntax-error">Syntax Error Test</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
