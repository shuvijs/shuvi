import { Loader, useLoaderData } from '@shuvi/runtime';

export default function Page() {
  const data = useLoaderData<ReturnType<typeof loader>>();
  return <div id="url-data">{JSON.stringify(data)}</div>;
}

export const loader: Loader = async ctx => {
  return {
    query: ctx.query,
    params: ctx.params,
    pathname: ctx.pathname
  };
};
