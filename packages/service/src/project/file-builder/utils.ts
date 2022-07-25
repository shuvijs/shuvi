export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ifIntersect = <T>(setA: Set<T>, setB: Set<T>) => {
  const merged = new Set([...Array.from(setA), ...Array.from(setB)]);
  return merged.size !== setA.size + setB.size;
};
