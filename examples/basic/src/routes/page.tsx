import { useEffect } from 'react';
import { Link } from '@shuvi/runtime';
import esModule from '@shuvi/package-esmodule';
import { consoleLog } from '@shuvi/package-esmodule/utils';
import styles from './style.css';

const Home = () => {
  useEffect(() => {
    esModule(`from '@shuvi/package-esmodule'`);
    consoleLog(`Hello from '@shuvi/package-esmodule/utils'`);
  }, []);

  return (
    <div>
      <div className={styles.hello}>
        <p>Hello World</p>
      </div>

      <div className={styles.links}>
        <Link to="/">Go to /</Link>
        <Link to="/home">Go to /home</Link>
        <Link to="/fatal-link-demo">Go to /fatal-link-demo</Link>
        <Link to="/symbol-demo/calc">Go to /:symbol/calc</Link>
      </div>
    </div>
  );
};

export default Home;
