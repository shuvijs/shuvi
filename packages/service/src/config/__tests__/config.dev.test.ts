import { webpack } from '@shuvi/toolpack/webpack';
import { loadFixture } from './utils';

const dotEnvConfigInlineSnapShot = `
Object {
  "conflictEnvShouldBeDevelopmentLocal": "development.local",
  "envLocalShouldBeTrue": "true",
  "shouldBe123": "123",
  "shouldBeBar": "bar",
  "shouldBeUndefined": undefined,
}
`;

describe('config under the development env', () => {
  beforeEach(() => {
    Object.assign(process.env, {
      NODE_ENV: 'development'
    });
  });

  test('should inject dotenv into config', async () => {
    const config = await loadFixture('dotenv');

    expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
  });

  test('should load config in esmodule', async () => {
    const config = await loadFixture('esm');

    expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
    expect(config.webpack).toBe(webpack);
  });

  test('should load config in typescript', async () => {
    const config = await loadFixture('typescript');

    expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
  });

  test('should load config in typescript using defineConfig', async () => {
    const config = await loadFixture('typescript');

    expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
  });
});
