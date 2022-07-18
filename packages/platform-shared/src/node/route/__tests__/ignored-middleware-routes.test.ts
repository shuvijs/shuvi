import { getFixtureMiddlewareRoutes } from './middleware.test';

const fixtureName = 'ignored-middleware-routes';

describe('ignored route files test', () => {
  it('should get correct result when ignore **/*', async () => {
    const result = await getFixtureMiddlewareRoutes(fixtureName, ['**/*']);
    expect(result).toMatchObject({
      routes: [],
      errors: [],
      warnings: []
    });
  });

  it('should get correct result when ignore b/*', async () => {
    const result = await getFixtureMiddlewareRoutes(fixtureName, ['b/*']);
    expect(result).toMatchObject({
      routes: [
        { path: '/c/c1/*', middleware: 'c/c1/middleware.js' },
        { path: '/c/*', middleware: 'c/middleware.js' },
        { path: '/*', middleware: 'middleware.js' }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/**', async () => {
    const result = await getFixtureMiddlewareRoutes(fixtureName, [
      'c/**',
      'b/*'
    ]);

    expect(result).toMatchObject({
      routes: [{ path: '/*', middleware: 'middleware.js' }],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/*', async () => {
    const result = await getFixtureMiddlewareRoutes(fixtureName, [
      'c/*',
      'b/*'
    ]);
    expect(result).toMatchObject({
      routes: [
        {
          middleware: 'c/c1/middleware.js',
          path: '/c/c1/*'
        },
        { path: '/*', middleware: 'middleware.js' }
      ],
      warnings: [],
      errors: []
    });
  });
});
