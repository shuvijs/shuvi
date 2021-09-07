import { getCurrentInstance } from '@tarojs/taro';

export default {
  name: 'querystring',

  lookup(options) {
    let found;

    const instance = getCurrentInstance();

    if (instance) {
      let params = getCurrentInstance().router.params;
      for (let key of Object.keys(params)) {
        if (key === options.lookupQuerystring) {
          found = params[key];
        }
      }
    }

    return found;
  }
};
