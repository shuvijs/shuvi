import { RouterView, useRouter, useCurrentRoute } from '@shuvi/runtime';
export default function Page() {
  const router = useRouter();
  const route = useCurrentRoute();
  console.log('----router', router.resolve(route));
  return <RouterView />;
}
