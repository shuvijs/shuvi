function mergeTwoObject(origin: any, target: any) {
  if (target === null || typeof target === "undefined") {
    return origin;
  }

  Object.keys(target).forEach(key => {
    const originValue = origin[key];
    const targetValye = target[key];
    if (typeof originValue === "object" && typeof targetValye === "object") {
      origin[key] = merge(originValue, targetValye);
    } else if (typeof targetValye === "object") {
      origin[key] = merge({}, targetValye);
    } else {
      origin[key] = targetValye;
    }
  });
  return origin;
}

export function merge(...args: any[]) {
  return args.reduce(mergeTwoObject, {});
}
