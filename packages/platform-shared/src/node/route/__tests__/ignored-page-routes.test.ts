import { getFixturePageRoutes } from './route.test';

const fixtureName = 'ignored-page-routes';

describe('ignored route files test', () => {
  it('should get correct result when ignore **/*', async () => {
    const result = await getFixturePageRoutes(fixtureName, ['**/*']);
    expect(result).toMatchObject({
      routes: [],
      errors: [],
      warnings: []
    });
  });

  it('should get correct result when ignore b/*', async () => {
    const result = await getFixturePageRoutes(fixtureName, ['b/*']);
    expect(result).toMatchObject({
      routes: [
        { path: '/c/c1', component: 'c/c1/page.js' },
        { path: '/c', component: 'c/page.js' },
        { path: '/', component: 'page.js' }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/**', async () => {
    const result = await getFixturePageRoutes(fixtureName, ['c/**', 'b/*']);

    expect(result).toMatchObject({
      routes: [{ path: '/', component: 'page.js' }],
      warnings: [],
      errors: []
    });
  });

  it('should get correct result when ignore b/* and c/*', async () => {
    const result = await getFixturePageRoutes(fixtureName, ['c/*', 'b/*']);
    expect(result).toMatchObject({
      routes: [{ path: '/', component: 'page.js' }],
      warnings: [],
      errors: []
    });
  });
});
