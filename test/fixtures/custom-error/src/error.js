import React from 'react';
import { Link } from '@shuvi/runtime';
export default ({ errorCode, errorDesc, error }) => {
  const [showError, setErrorStatus] = React.useState(false);
  React.useEffect(() => {
    setErrorStatus(true);
  });
  return (
    <div style={{ color: 'red' }}>
      <div id="error">
        custom error {errorCode} {errorDesc}
      </div>
      <br />
      <div id="error-stack">{error?.stack}</div>
      <Link id="to-about" to="/about">
        about
      </Link>
      {showError ? (
        <div id="error-show-client">error only in client for test</div>
      ) : null}
    </div>
  );
};
