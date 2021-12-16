import createGlobalStore from './createGlobalStore';

const { Provider, useModel, useStaticModel, useLocalModel } = createGlobalStore(
  {}
);

export { Provider, useModel, createGlobalStore, useStaticModel, useLocalModel };
