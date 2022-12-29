import { useLoaderData } from '@shuvi/runtime';

export default function Index() {
  const { testFlag } = useLoaderData();
  return (
    <>
      <div id="page">Index Page</div>
      <div id="test-flag">{testFlag}</div>
    </>
  );
}
export const loader = ctx => {
  return {
    testFlag: ctx.appContext.testFlag
  };
};
