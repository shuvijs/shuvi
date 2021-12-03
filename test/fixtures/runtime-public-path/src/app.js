import { useState, useEffect } from 'react';

const getApp = App => () => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  return (
    <div>
      {render ? <div id="public-path">{__webpack_require__.p}</div> : ''}
    </div>
  );
};

export default getApp;
