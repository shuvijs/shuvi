function serializeAppContext(ctx) {
  return Object.keys(ctx).reduce((acc, key) => {
    const value = ctx[key];
    if (key === 'req') {
      acc['req'] = {
        headers: value.headers,
        url: value.url,
        pathname: value.pathname,
        query: value.query
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

export function normalizeContextForSerialize(ctx) {
  return Object.keys(ctx).reduce((acc, key) => {
    const value = ctx[key];
    if (key === 'appContext') {
      acc[key] = serializeAppContext(value);
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

export const sleep = async time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
};
