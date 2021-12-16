// omit key from an object
export default <P extends keyof O, O extends Record<string, any>>(
  prop: P,
  obj: O
) =>
  Object.keys(obj).reduce((next, key: string) => {
    if (key !== prop) {
      next[key] = obj[key];
    }
    return next;
  }, {} as Record<string, any>);
