import { getRoutesWithLayoutFromDir } from '../';
import { getFixturePath } from './utils';
import { withoutLayoutResult } from './fixtures/without-layout-result';
import { layoutResult } from './fixtures/layout-result';
import { dynamicPathResult } from './fixtures/dynamic-path-result';
import { emptyHarmonyResult } from './fixtures/empty-harmony-result';

const getRoutes = (pathname: string) => {
  return getRoutesWithLayoutFromDir(getFixturePath(pathname));
};

describe('route test', () => {
  test('without layout', async () => {
    const routes = await getRoutes('without-layout');
    expect(routes).toMatchObject(withoutLayoutResult);
  });

  test('has layout', async () => {
    const routes = await getRoutes('layout');
    expect(routes).toMatchObject(layoutResult);
  });

  test('dynamic path', async () => {
    const routes = await getRoutes('dynamic-path');
    expect(routes).toMatchObject(dynamicPathResult);
  });

  test('empty harmony', async () => {
    const routes = await getRoutes('empty-harmony');
    expect(routes).toMatchObject(emptyHarmonyResult);
  });

  test('empty exception', () => {
    expect(getRoutes('empty-exception')).rejects.toBeTruthy();
  });
});
