import style from '../style.css';
import m from '../modules.css';

export default () => (
  <div>
    <div id="css-modules" className={style.test}>
      css modules
    </div>
    <div className={m.className1}>className1</div>
    <div className={m.otherClassName}>otherClassName</div>
    <div className={m.otherClassName2}>otherClassName2</div>
    <div className={m.simple}>simple</div>
    <div id="next-button" className={m.nextButton}>
      nextButton
    </div>
  </div>
);
