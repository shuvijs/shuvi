import { getFixtureApiRoutes } from './api.test';

describe('ignored route files test', () => {
  it('should get correct result when ignore **/*', async () => {
    const result = await getFixtureApiRoutes('ignored-api-routes', ['**/*']);
    expect(result).toMatchObject({
      routes: [],
      errors: [],
      warnings: []
    });
  });

  it('should get correct result when ignore b/*', async () => {
    const result = await getFixtureApiRoutes('ignored-api-routes', ['b/*']);

    expect(result).toMatchObject({
      routes: [
        { path: '/c/c1', api: 'c/c1/api.js' },
        { path: '/', api: 'api.js' },
        { path: '/c', api: 'c/api.js' }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/**', async () => {
    const result = await getFixtureApiRoutes('ignored-api-routes', [
      'c/**',
      'b/*'
    ]);

    expect(result).toMatchObject({
      routes: [{ path: '/', api: 'api.js' }],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/*', async () => {
    const result = await getFixtureApiRoutes('ignored-api-routes', [
      'c/*',
      'b/*'
    ]);

    expect(result).toMatchObject({
      routes: [
        {
          api: 'c/c1/api.js',
          path: '/c/c1'
        },
        { path: '/', api: 'api.js' }
      ],
      warnings: [],
      errors: []
    });
  });
});
