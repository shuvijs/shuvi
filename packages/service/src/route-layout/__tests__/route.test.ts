/// <reference types="jest-extended" />

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
  // 没有layout 只有page的场景
  test('without layout', async () => {
    const routes = await getRoutes('without-layout');
    expect(routes).toMatchObject(withoutLayoutResult);
  });
  // 有layout和page的混合场景
  test('has layout', async () => {
    const routes = await getRoutes('layout');
    expect(routes).toMatchObject(layoutResult);
  });
  // 简单和复杂的嵌套dynamic path场景
  test('dynamic path', async () => {
    const routes = await getRoutes('dynamic-path');
    expect(routes).toMatchObject(dynamicPathResult);
  });
  // 空文件夹的反向场景： 有空目录，但至少能生成一个route，兼容。
  test('empty harmony', async () => {
    const routes = await getRoutes('empty-harmony');
    expect(routes).toMatchObject(emptyHarmonyResult);
  });
  // 空文件夹的异常场景： 有空目录，但一个route也没生成，不兼容。
  test('empty exception', () => {
    expect(getRoutes('empty-exception')).toReject();
  });
});
