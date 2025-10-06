import styles from 'a.css?existing=true';
import styles2 from 'a.less?foo=bar';
import styles3 from 'a.css?foo=bar&baz=qux';
import styles4 from 'a.css?foo=bar&baz=qux&test=123';

console.log(styles, styles2, styles3, styles4);
