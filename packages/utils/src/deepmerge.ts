function mergeTwoObject(origin: any, target: any) {
  if (target === null || typeof target === 'undefined') {
    return origin;
  }
  const result = { ...origin };

  Object.keys(target).forEach(key => {
    const originValue = result[key];
    const targetValue = target[key];
    if (Array.isArray(originValue) || Array.isArray(targetValue)) {
      result[key] = targetValue;
    } else if (
      typeof originValue === 'object' &&
      typeof targetValue === 'object'
    ) {
      result[key] = mergeTwoObject(originValue, targetValue);
    } else {
      result[key] = targetValue;
    }
  });
  return result;
}

export function deepmerge(...args: any[]) {
  return args.reduce(mergeTwoObject, {});
}
