import { Link } from '@shuvi/app';
export default ({ errorCode, errorDesc }) => {
  return (
    <div id="error" style={{ color: 'red' }}>
      custom error {errorCode} {errorDesc}
      <br />
      <Link to="/about">about</Link>
    </div>
  );
};
