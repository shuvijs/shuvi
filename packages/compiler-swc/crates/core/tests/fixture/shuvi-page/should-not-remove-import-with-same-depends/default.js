import { logSomeThing, aa } from '../utils';
const bb = 22;
const Error = () => {
  console.log(bb);
  console.log(aa);
  logSomeThing();
  return __jsx('div', null, 'Error');
};
export default Error;
