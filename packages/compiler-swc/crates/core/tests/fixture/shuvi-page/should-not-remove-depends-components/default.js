import { warp } from '../utils';
const bb = 22;
const C = __jsx('div', null, 'bb');
const Error = warp(function () {
  return __jsx('div', null, __jsx(C, null));
});
export default Error;
