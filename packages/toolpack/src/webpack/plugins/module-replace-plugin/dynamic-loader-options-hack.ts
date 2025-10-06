const dataMap = new Map();

export default {
  setData(key: string, val: any) {
    dataMap.set(key, val);
  },
  /**
   * return the value and delete the key
   */
  pop(key: string) {
    const val = dataMap.get(key);
    dataMap.delete(key);
    return val;
  }
};
