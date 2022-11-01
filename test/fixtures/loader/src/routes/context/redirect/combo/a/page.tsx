import { Loader } from '@shuvi/runtime';

export default function Page() {
  return <div>A</div>;
}

export const loader: Loader = async ({ redirect }) => {
  return redirect('/context/redirect/combo/b');
};
