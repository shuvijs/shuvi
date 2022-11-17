import { logSomeThing } from '../utils';

const Error = () => {
  logSomeThing();
  return <div>Error</div>;
};

export default Error;

export const loader = async () => {
  logSomeThing();
  return {};
};
