import { useEffect } from 'react';
import esModule from '@shuvi/package-esmodule';
import { consoleLog } from '@shuvi/package-esmodule/utils';
import styles from './style.css';

const Home = () => {
  useEffect(() => {
    esModule(`from '@shuvi/package-esmodule'`);
    consoleLog(`Hello from '@shuvi/package-esmodule/utils'`);
  }, []);

  return (
    <div className={styles.hello}>
      <p>Hello World</p>
    </div>
  );
};

export default Home;
