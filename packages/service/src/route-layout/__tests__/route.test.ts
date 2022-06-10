import { getRoutesWithLayoutFromDir } from '../';
import { hasNotLayoutResult } from './fixtures/has-not-layout-result';
import { hasLayoutResult } from './fixtures/has-layout-result';
import { getFixturePath } from './utils';

describe('route test', function () {
  test('page mode should be generate correct', () => {
    const routes = getRoutesWithLayoutFromDir(getFixturePath('has-not-layout'));
    expect(routes).toMatchObject(hasNotLayoutResult);
  });

  test('layout mode should be generate correct', () => {
    const routes = getRoutesWithLayoutFromDir(getFixturePath('has-layout'));
    expect(routes).toMatchObject(hasLayoutResult);
  });
});
