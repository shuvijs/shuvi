import { getRoutesWithLayoutFromDir } from '../';
import { getFixturePath } from './utils';
import { withoutLayoutResult } from './fixtures/without-layout-result';
import { layoutResult } from './fixtures/layout-result';
import { dynamicPathResult } from './fixtures/dynamic-path-result';
import { emptyHarmonyResult } from './fixtures/empty-harmony-result';

const getRoutes = (pathname: string) => {
  return getRoutesWithLayoutFromDir(getFixturePath(pathname));
};

describe('route test', function () {
  test('has not layout', () => {
    const routes = getRoutes('has-not-layout');
    expect(routes).toMatchObject(withoutLayoutResult);
  });

  test('has layout', () => {
    const routes = getRoutes('has-layout');
    expect(routes).toMatchObject(layoutResult);
  });

  test('has dynamic path', () => {
    const routes = getRoutes('has-dynamic-path');
    expect(routes).toMatchObject(dynamicPathResult);
  });

  test('has not file harmony', () => {
    const routes = getRoutes('has-not-file-harmony');
    expect(routes).toMatchObject(emptyHarmonyResult);
  });

  test('has not file exception', () => {
    expect(() => getRoutes('has-not-file-exception')).toThrow();
  });
});
