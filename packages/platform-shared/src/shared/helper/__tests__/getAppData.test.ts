/**
 * @jest-environment jsdom
 */
import { CLIENT_APPDATA_ID } from '@shuvi/shared/constants';

// getAppData keeps the parsed #__APP_DATA in module state, so every test loads a fresh copy.
const load = (): typeof import('../getAppData').getAppData => {
  let getAppData: any;
  jest.isolateModules(() => {
    getAppData = require('../getAppData').getAppData;
  });
  return getAppData;
};

const setAppData = (data: unknown) => {
  const el = document.createElement('script');
  el.id = CLIENT_APPDATA_ID;
  el.type = 'application/json';
  el.textContent = JSON.stringify(data);
  document.body.appendChild(el);
};

describe('getAppData', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('returns the parsed #__APP_DATA', () => {
    const data = {
      ssr: true,
      pageData: { a: 1 },
      filesByRoutId: {},
      publicPath: '/'
    };
    setAppData(data);
    expect(load()()).toEqual(data);
  });

  it('parses #__APP_DATA once and returns the same object afterwards', () => {
    setAppData({
      ssr: true,
      pageData: { a: 1 },
      filesByRoutId: {},
      publicPath: '/'
    });
    const getAppData = load();
    const parse = jest.spyOn(JSON, 'parse');

    const first = getAppData();
    expect(getAppData()).toBe(first);
    expect(getAppData()).toBe(first);
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('does not cache the default returned before #__APP_DATA exists', () => {
    const getAppData = load();
    expect(getAppData()).toEqual({
      ssr: false,
      pageData: {},
      filesByRoutId: {},
      publicPath: '/',
      runtimeConfig: {}
    });

    setAppData({
      ssr: true,
      pageData: { a: 1 },
      filesByRoutId: {},
      publicPath: '/'
    });
    expect(getAppData().ssr).toBe(true);
  });
});
