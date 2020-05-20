export function normalizeContextForSerialize(ctx) {
  return Object.keys(ctx).reduce((acc, key) => {
    const value = ctx[key];
    if (key === 'req') {
      acc[key] = {
        headers: value.headers,
        url: value.url,
        parsedUrl: value.parsedUrl
      };
    } else {
      const type = typeof value;
      if (type === 'function') {
        acc[key] = 'function';
      } else {
        acc[key] = ctx[key];
      }
    }

    return acc;
  }, {});
}
