import { shuviSync, resolveFixture } from '../utils';

jest.setTimeout(30 * 1000);

describe('shuvi lint', () => {
  let message = '';

  beforeAll(async () => {
    const projectRoot = resolveFixture('eslint');
    const child_process = shuviSync('lint', [projectRoot]);
    message = child_process.stderr.toString();
  });

  it('should tip no-html-link-for-pages', async () => {
    expect(message).toMatch('./src/routes/page.js');
    expect(message).toMatch(
      'Error: Do not use an `<a>` element to navigate to `/other/`. Use `<Link />` from `shuvi/runtime` instead.'
    );
  });

  it('should tip page typo', async () => {
    expect(message).toMatch('./src/routes/page.js');
    expect(message).toMatch('Error: loaders may be a typo.');
  });

  it('should tip src/app typo', async () => {
    expect(message).toMatch('./src/app.js');
    expect(message).toMatch('Error: inits may be a typo.');
    expect(message).toMatch('Error: appContexts may be a typo.');
    expect(message).toMatch('Error: appComponents may be a typo.');
    expect(message).toMatch('Error: disposes may be a typo.');
  });

  it('should tip src/server typo', async () => {
    expect(message).toMatch('./src/server.js');
    expect(message).toMatch('Error: getPageDatas may be a typo.');
    expect(message).toMatch('Error: handlePageRequests may be a typo.');
    expect(message).toMatch('Error: modifyHtmls may be a typo.');
    expect(message).toMatch('Error: sendHtmls may be a typo.');
  });
});
