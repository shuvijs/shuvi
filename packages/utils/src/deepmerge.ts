function mergeTwoObject(origin: any, target: any) {
  if (target === null || typeof target === 'undefined') {
    return origin;
  }

  Object.keys(target).forEach((key) => {
    const originValue = origin[key];
    const targetValue = target[key];
    if (Array.isArray(originValue) || Array.isArray(targetValue)) {
      origin[key] = targetValue;
    } else if (
      typeof originValue === 'object' &&
      typeof targetValue === 'object'
    ) {
      origin[key] = mergeTwoObject(originValue, targetValue);
    } else {
      origin[key] = targetValue;
    }
  });
  return origin;
}

export function deepmerge(...args: any[]) {
  return args.reduce(mergeTwoObject, {});
}
