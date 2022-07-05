import { useEffect, useState } from 'react';
import { getRuntimeConfig } from '@shuvi/runtime';

function App() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <div id="no-private">{getRuntimeConfig().secretA}</div>
  ) : null;
}

export default App;
