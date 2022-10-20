import { PresetFunction } from '@shuvi/service';

import { dirname } from 'path';

const resolvePlugin = (name: string) => dirname(require.resolve(name));

const preset: PresetFunction = (_, option: string) => {
  return {
    plugins: [[resolvePlugin('shuvi-plugin-sample'), option]]
  };
};

export default preset;
