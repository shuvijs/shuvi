import { Loader } from '@shuvi/runtime';

export default function Page() {
  return <div>B</div>;
}

export const loader: Loader = async ({ redirect }) => {
  return redirect('/context/redirect/combo/c');
};
