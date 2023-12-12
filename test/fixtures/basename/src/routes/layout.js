import { RouterView, useRouter } from '@shuvi/runtime';
export default function Page() {
  const router = useRouter();
  console.log('----router', router);
  return <RouterView />;
}
