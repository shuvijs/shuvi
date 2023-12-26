/**
 * @jest-environment jsdom
 */

import { createHashHistory } from '..';
import { createRouter } from '../../router';
import { IRouter, IRouteRecord } from '../../types';

describe('a hash history on a page with a <base> tag', () => {
  let router: IRouter, base: HTMLBaseElement;
  beforeEach(() => {
    if (window.location.hash !== '#/') {
      window.location.hash = '/';
    }

    base = document.createElement('base');
    base.setAttribute('href', '/prefix');

    document.head.appendChild(base);

    let history = createHashHistory();
    router = createRouter({
      routes: [] as IRouteRecord[],
      history
    }).init();
  });

  afterEach(() => {
    document.head.removeChild(base);
  });

  it('should ignore base tag', () => {
    const { href } = router.resolve({
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash'
    });

    expect(href).toEqual('#/the/path?the=query#the-hash');
  });
});
