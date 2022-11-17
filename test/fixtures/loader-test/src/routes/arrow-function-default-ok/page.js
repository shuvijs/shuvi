import { logSomeThing } from '../utils';

export default () => {
  logSomeThing();
  return <div>OK</div>;
};

export const loader = async () => {
  logSomeThing();
  return {};
};
