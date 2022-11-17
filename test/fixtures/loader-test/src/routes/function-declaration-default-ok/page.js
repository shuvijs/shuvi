import { logSomeThing } from '../utils';

export default function Page() {
  logSomeThing();
  return <div>OK</div>;
}

export const loader = async () => {
  logSomeThing();
  return {};
};
