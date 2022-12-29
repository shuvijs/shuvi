import { PitchLoaderDefinitionFunction } from 'webpack';

export const pitch: PitchLoaderDefinitionFunction<{}> = function (this) {
  return `export {}`;
};
