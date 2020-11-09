// serverMiddleware will cache the server.js module,
// We have to reset it manully, because requre.cache doesn't work in jest
const clearRequireCache = async (_, next) => {
  jest.resetModules();
  await next();
};

export const serverMiddleware = [clearRequireCache];
