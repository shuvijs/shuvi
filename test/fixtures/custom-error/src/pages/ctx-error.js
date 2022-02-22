function err({ position }) {
  return <div id="ctx-error">Ctx.error Page Render: {position}</div>;
}
err.getInitialProps = function (ctx) {
  if (ctx.query.a) {
    ctx.error(502, 'custom error describe');
  }
  return {
    position: ctx.isServer ? 'server' : 'client'
  };
};
export default err;
