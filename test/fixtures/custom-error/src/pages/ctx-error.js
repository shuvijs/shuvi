import { useLoaderData } from '@shuvi/runtime';

function err() {
  const data = useLoaderData();
  return <div id="ctx-error">Ctx.error Page Render: {data.position}</div>;
}

export const loader = function (ctx) {
  if (ctx.query.a) {
    ctx.error(502, 'custom error describe');
  }

  return {
    position: ctx.isServer ? 'server' : 'client'
  };
};

export default err;
