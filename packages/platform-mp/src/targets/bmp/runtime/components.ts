import { singleQuote } from '@tarojs/shared';

export const components = {
  // 组件名 CamelCase
  DeprecatedInput:
    // 属性对象
    {
      // value 为空字符串时，代表不设置默认值
      value: '',
      placeholder: '',
      // 属性默认值为布尔值或数字时，value 写为字符串
      password: 'false',
      disabled: 'false',
      autoFocus: 'false',
      focus: 'false',
      maxlength: '140',
      // 属性默认值为字符串时，需要使用 singleQuote 函数进行包裹
      type: singleQuote('text')
    },

  DeprecatedTextarea: {
    value: '',
    placeholder: '',
    disabled: 'false',
    autoFocus: 'false',
    focus: 'false',
    maxlength: '140'
  }
};
