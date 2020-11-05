const HEADER_KEY_CACHE_CONTROL = 'cache-control';
const NO_CACHE = 'no-cache, no-store, must-revalidate'
const WITH_CACHE = age => `max-age=${age}, must-revalidate`;
const ZERO = 0;

export default cache => {
  return async (ctx, next) => {
    ctx.set(
      HEADER_KEY_CACHE_CONTROL,
      cache === false
        ? NO_CACHE
        : WITH_CACHE(parseInt((cache.maxAge || ZERO) / 1000, 10))
    );
    await next();
  };
};
