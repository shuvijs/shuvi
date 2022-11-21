import { logSomeThing, aa } from '../utils';

const bb = 22;

const Error = () => {
  console.log(bb);
  console.log(aa);
  logSomeThing();
  return <div>Error</div>;
};

export default Error;

export const loader = async () => {
  console.log(bb);
  console.log(aa);
  logSomeThing();
  return {};
};
