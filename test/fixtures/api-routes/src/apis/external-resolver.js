export default (_req, res) => {
  setTimeout(() => {
    res.send('hello world');
  }, 0);
};

export const config = {
  apiRouteConfig: {
    externalResolver: true
  }
};
