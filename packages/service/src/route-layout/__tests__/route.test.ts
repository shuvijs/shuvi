import { getRoutesWithLayoutFromDir } from '../';
import { getFixturePath } from './utils';
import { hasNotLayoutResult } from './fixtures/has-not-layout-result';
import { hasLayoutResult } from './fixtures/has-layout-result';
import { hasDynamicPathResult } from './fixtures/has-dynamic-path-result';
import { hasNotFileHarmonyResult } from './fixtures/has-not-file-harmony-result';

const getRoutes = (pathname: string) => {
  return getRoutesWithLayoutFromDir(getFixturePath(pathname));
};

describe('route test', function () {
  test('has not layout', () => {
    const routes = getRoutes('has-not-layout');
    expect(routes).toMatchObject(hasNotLayoutResult);
  });

  test('has layout', () => {
    const routes = getRoutes('has-layout');
    expect(routes).toMatchObject(hasLayoutResult);
  });

  test('has dynamic path', () => {
    const routes = getRoutes('has-dynamic-path');
    expect(routes).toMatchObject(hasDynamicPathResult);
  });

  test('has not file harmony', () => {
    const routes = getRoutes('has-not-file-harmony');
    expect(routes).toMatchObject(hasNotFileHarmonyResult);
  });

  test('has not file exception', () => {
    expect(() => getRoutes('has-not-file-exception')).toThrow();
  });
});
