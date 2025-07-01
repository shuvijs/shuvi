import styles from 'a.css?existing=true';
import styles2 from 'a.less?foo=bar';
import styles3 from 'a.css?foo=bar&baz=qux';

console.log(styles, styles2, styles3);
