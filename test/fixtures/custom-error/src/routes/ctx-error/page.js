import { useLoaderData } from '@shuvi/runtime';

export const loader = ctx => {
  const id = ctx.req ? 'server' : 'client';
  if (ctx.query.a) {
    return ctx.error(`custom error ${id}`, 502);
  }

  return {
    position: id
  };
};

function err() {
  const { position } = useLoaderData();
  return <div id="ctx-error">Ctx.error Page Render: {position}</div>;
}

export default err;
