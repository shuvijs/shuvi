import { useState, useEffect } from 'react';

const MyApp = () => {
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

export default MyApp;
