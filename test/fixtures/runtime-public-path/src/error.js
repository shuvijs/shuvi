import React from 'react';
export default ({ errorCode, errorDesc }) => {
  const [render, setRender] = React.useState(false);
  React.useEffect(() => {
    setRender(true);
  });
  return (
    <div style={{ color: 'red' }}>
      <div id="error">
        custom error {errorCode} {errorDesc}
      </div>
      <br />
      <div>
        {render ? <div id="public-path">{__webpack_require__.p}</div> : ''}
      </div>
    </div>
  );
};
