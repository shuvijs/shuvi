function mergeTwoObject(origin: any, target: any) {
  if (target === null || typeof target === "undefined") {
    return origin;
  }

  Object.keys(target).forEach(key => {
    const originValue = origin[key];
    const targetValye = target[key];
    if (Array.isArray(originValue) && Array.isArray(targetValye)) {
      origin[key] = targetValye;
    } else if (
      typeof originValue === "object" &&
      typeof targetValye === "object"
    ) {
      origin[key] = mergeTwoObject(originValue, targetValye);
    } else {
      origin[key] = targetValye;
    }
  });
  return origin;
}

export function deepmerge(...args: any[]) {
  return args.reduce(mergeTwoObject, {});
}
