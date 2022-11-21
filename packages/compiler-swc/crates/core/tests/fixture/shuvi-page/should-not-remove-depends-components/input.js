import { warp } from '../utils';

const bb = 22;

const C = <div>bb</div>;

const Error = warp(function () {
  return (
    <div>
      <C />
    </div>
  );
});

export default Error;
