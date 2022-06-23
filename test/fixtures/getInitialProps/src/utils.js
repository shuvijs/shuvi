function serializeRequest(req) {
  return {
    headers: req.headers,
    url: req.url,
    pathname: req.pathname,
    query: req.query
  };
}

export function normalizeContextForSerialize(ctx) {
  return Object.keys(ctx).reduce((acc, key) => {
    const value = ctx[key];
    if (key === 'req') {
      acc[key] = serializeRequest(value);
    } else if (key === 'appContext') {
      acc[key] = normalizeContextForSerialize(value);
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
