/**
 * @jest-environment jsdom
 */

import { createHashHistory } from '..';
import { createRouter } from '../../router';
import { IRouter } from '../../types';

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
      routes: [],
      history
    });
  });

  afterEach(() => {
    document.head.removeChild(base);
  });

  it('knows how to create hrefs', () => {
    const hashIndex = window.location.href.indexOf('#');
    const upToHash =
      hashIndex === -1
        ? window.location.href
        : window.location.href.slice(0, hashIndex);

    const { href } = router.resolve({
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash'
    });

    expect(href).toEqual(upToHash + '#/the/path?the=query#the-hash');
  });
});
