import style from '../style.css';
import style2 from '../sass/style.sass';
import style3 from '../scss/style.scss';

export default () => (
  <div>
    <div data-test-id="css" className={style.test}></div>
    <div data-test-id="sass" className={style2.test}></div>
    <div data-test-id="scss" className={style3.test}></div>
  </div>
);
