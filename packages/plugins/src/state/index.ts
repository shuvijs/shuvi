import createContainer from './createContainer';

const { Provider, useModel, useStaticModel, useLocalModel } = createContainer({});

export { Provider, useModel, createContainer, useStaticModel, useLocalModel };

export { defineModel } from './model'
