function err() {
  return <div id="err">Err Page Render</div>;
}
err.getInitialProps = function (ctx) {
  if (ctx.query.a) {
    ctx.error(502, 'custom error describe');
  }
  return {};
};
export default err;
