import { logSomeThing } from '../utils';

function Page() {
  logSomeThing();
  return <div>OK</div>;
}

export default Page;

export const loader = async () => {
  logSomeThing();
  return {};
};
