import { useState, useEffect } from 'react';
import { getPageData } from '@shuvi/app';

export default () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <div data-test-id="page-data">{getPageData('foo')}</div>
  ) : null;
};
