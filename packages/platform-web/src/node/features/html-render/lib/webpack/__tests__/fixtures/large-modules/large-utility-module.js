// Large utility module with many functions
export const utils = {
  // String utilities
  capitalize: str => str.charAt(0).toUpperCase() + str.slice(1),
  reverse: str => str.split('').reverse().join(''),
  truncate: (str, length) =>
    str.length > length ? str.slice(0, length) + '...' : str,
  slugify: str =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),

  // Array utilities
  chunk: (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    ),
  shuffle: arr => arr.sort(() => Math.random() - 0.5),
  unique: arr => [...new Set(arr)],
  flatten: arr =>
    arr.reduce(
      (flat, item) => flat.concat(Array.isArray(item) ? flatten(item) : item),
      []
    ),

  // Object utilities
  pick: (obj, keys) =>
    keys.reduce(
      (result, key) => (key in obj && (result[key] = obj[key]), result),
      {}
    ),
  omit: (obj, keys) =>
    Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((result, key) => ((result[key] = obj[key]), result), {}),
  deepClone: obj => JSON.parse(JSON.stringify(obj)),
  merge: (target, ...sources) => Object.assign(target, ...sources),

  // Date utilities
  formatDate: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    return format
      .replace('YYYY', d.getFullYear())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'));
  },
  isToday: date => {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  },

  // Math utilities
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  round: (num, decimals = 2) =>
    Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  clamp: (num, min, max) => Math.min(Math.max(num, min), max),

  // Validation utilities
  isEmail: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isUrl: url => /^https?:\/\/.+/.test(url),
  isPhone: phone => /^\+?[\d\s-()]+$/.test(phone),

  // Async utilities
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await utils.delay(delay);
        return utils.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }
};

export default utils;
