import { useLoaderData } from '@shuvi/runtime';

export const loader = ctx => {
  if (ctx.query.a) {
    ctx.error(502, 'custom error describe');
  }

  return {
    position: ctx.isServer ? 'server' : 'client'
  };
};

function err() {
  const { position } = useLoaderData();
  return <div id="ctx-error">Ctx.error Page Render: {position}</div>;
}

export default err;
