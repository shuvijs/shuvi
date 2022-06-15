import { getRoutesWithLayoutFromDir } from '../';
import { getFixturePath } from './utils';
import { withoutLayoutResult } from './fixtures/without-layout-result';
import { layoutResult } from './fixtures/layout-result';
import { dynamicPathResult } from './fixtures/dynamic-path-result';

const normalizePath = (basepath: string, routes: any[]) => {
  return routes.map(r => {
    let nr = {
      ...r
    };
    nr.filepath = r.filepath.replace(basepath + '/', '');

    if (nr.children) {
      nr.children = normalizePath(basepath, r.children);
    }
    return nr;
  });
};

const getRoutes = async (pathname: string) => {
  const dir = getFixturePath(pathname);
  const routes = await getRoutesWithLayoutFromDir(dir);
  return normalizePath(dir, routes);
};

describe('filesystem routes', () => {
  it('should work', async () => {
    const routes = await getRoutes('without-layout');
    expect(routes).toMatchObject(withoutLayoutResult);
  });

  it('should handle layout', async () => {
    const routes = await getRoutes('layout');
    expect(routes).toMatchObject(layoutResult);
  });

  it('should handle dynamic path', async () => {
    const routes = await getRoutes('dynamic-path');
    expect(routes).toMatchObject(dynamicPathResult);
  });

  it('show ignore empty page segment and has warnings case 1', async () => {
    const routes = await getRoutes('warning-empty-page-segments');
    expect(routes).toMatchObject([]);
    // todo: check warnings
  });

  it('should ignore empty page segment and has warnings case 2', async () => {
    const routes = await getRoutes('warning-empty-page-segment');
    expect(routes).toMatchObject([
      {
        path: '/a',
        filepath: 'a/page.js'
      }
    ]);
    // todo: check warnings
  });

  it('should ignore useless page.js and has warnings', async () => {
    const routes = await getRoutes('warning-useless-pagejs');
    expect(routes).toMatchObject([
      {
        path: '/a',
        filepath: 'a/page.js'
      }
    ]);
    // todo: check warnings
  });

  it('should ignore useless layout.js and has warnings', async () => {
    const routes = await getRoutes('warning-useless-layoutjs');
    expect(routes).toMatchObject([
      {
        path: '/a',
        filepath: 'a/page.js'
      }
    ]);
    // todo: check warnings
  });
});
