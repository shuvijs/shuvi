import otherConfigs from './otherConfigs';
export default {
  ssr: true,
  env: {
    shouldBe123: process.env.test,
    shouldBeBar: process.env.foo,
    shouldBeUndefined: process.env.undefined,
    envLocalShouldBeTrue: process.env.envLocal,
    conflictEnvShouldBeDevelopmentLocal: process.env.conflictEnv
  },
  ...otherConfigs
};
