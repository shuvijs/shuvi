import { logSomeThing, aa } from '../utils';
const bb = 22;
export const loader = async () => {
  console.log(bb);
  console.log(aa);
  logSomeThing();
  return {};
};
