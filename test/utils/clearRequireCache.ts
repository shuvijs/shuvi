const clearRequireCache = async (_: any, next: any) => {
  if (process.env.DISABLE_RESET_MODULES !== 'true') {
    jest.resetModules();
  }
  await next();
};

export default clearRequireCache;
