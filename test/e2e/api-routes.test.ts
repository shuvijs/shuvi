import got from 'got';
import { AppCtx, launchFixture, resolveFixture } from '../utils';
import { writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { waitForResponseChange } from '../utils/wait-for-response-change';

let ctx: AppCtx;
let stderr = '';
const json = require(resolveFixture('api-routes/big.json'));

jest.setTimeout(5 * 60 * 1000);

describe('apiRoutes development', () => {
  beforeAll(async () => {
    stderr = '';
    ctx = await launchFixture('api-routes', {}, {}, true, {
      onStderr(error) {
        stderr += error;
      }
    });
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('should work', async () => {
    let res;
    res = await got.get(ctx.url('/api/set-header'));
    expect(res.body).toBe('200 OK');
    expect(res.headers).toHaveProperty('shuvi-custom-header', 'bar');
  });

  test('should render page', async () => {
    const page = await ctx.browser.page(ctx.url('/'));
    expect(await page.$text('div')).toMatch(/API - support/);
    await page.close();
  });

  test('should return 404 for undefined path', async () => {
    try {
      await got.get(ctx.url('/api/not/unexisting/page/really'));
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should not conflict with /api routes', async () => {
    const res = await got(ctx.url('/api-conflict'), {
      method: 'GET',
      headers: {
        accept: 'text/html, */*'
      }
    });
    expect(res.statusCode).toEqual(200);
  });

  test('should return data when catch-all', async () => {
    const res = await got.get(ctx.url('/api/users/1'));
    expect(JSON.parse(res.body)).toEqual({ '*': '1' });
  });

  // test('should return redirect when catch-all with index and trailing slash', async () => {
  //   // if (!isDataReq && cachedData.pageData?.pageProps?.__N_REDIRECT) {
  //   //   await handleRedirect(cachedData.pageData)
  //   // }
  //   const res = await got.get(ctx.url('/api/users/'), {
  //     redirect: 'manual',
  //   })
  //   expect(res.status).toBe(308)
  // })

  test('should return data when catch-all with index and trailing slash', async () => {
    const res = await got.get(ctx.url('/api/users/'));
    expect(JSON.parse(res.body)).toEqual({});
  });

  test('should return data when catch-all with index and no trailing slash', async () => {
    const res = await got.get(ctx.url('/api/users'));
    expect(JSON.parse(res.body)).toEqual({});
  });

  test('should set cors headers when adding cors middleware', async () => {
    const res = await got(ctx.url('/api/cors'), {
      method: 'OPTIONS',
      headers: {
        origin: 'example.com'
      }
    });

    expect(res.statusCode).toEqual(204);
    expect(res.headers).toHaveProperty(
      'access-control-allow-methods',
      'GET,POST,OPTIONS'
    );
  });

  test('should work with index api', async () => {
    const res = await got.get(ctx.url('/api/'));
    expect(res.body).toEqual('Index should work');
  });

  test('should return custom error', async () => {
    try {
      await got.get(ctx.url('/api/error'));
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(500);
      expect(JSON.parse(error.response.body)).toEqual({
        error: 'Server error!'
      });
    }
  });

  test('should throw Internal Server Error', async () => {
    try {
      await got.get(ctx.url('/api/user-error'));
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(500);
      expect(error.response.body).toContain('User error');
    }
  });

  test('should throw Internal Server Error (async)', async () => {
    try {
      await got.get(ctx.url('/api/user-error-async'));
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(500);
      expect(error.response.body).toContain('User error');
    }
  });

  test('should parse JSON body', async () => {
    const res = await got(ctx.url('/api/parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify([{ title: 'Shuvi' }])
    });
    expect(JSON.parse(res.body)).toEqual([{ title: 'Shuvi' }]);
  });

  test('should special-case empty JSON body', async () => {
    const res = await got(ctx.url('/api/parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    expect(JSON.parse(res.body)).toEqual({});
  });

  test('should not throw if request body is already parsed in custom middleware', async () => {
    const res = await got(ctx.url('/api'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify([{ title: 'Shuvi' }])
    });
    expect(JSON.parse(res.body)).toEqual([{ title: 'Shuvi' }]);
  });

  test("should not throw if request's content-type is invalid", async () => {
    const res = await got(ctx.url('/api'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;'
      },
      body: JSON.stringify([{ title: 'Shuvi' }])
    });

    expect(res.statusCode).toBe(200);
  });

  test('should support boolean for JSON in api page', async () => {
    const res = await got.get(ctx.url('/api/bool'));
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty(
      'content-type',
      'application/json; charset=utf-8'
    );
    expect(JSON.parse(res.body)).toBe(true);
  });

  test('should support undefined response body', async () => {
    const res = await got.get(ctx.url('/api/undefined'));
    expect(res.body).toBe('');
  });

  test('should return error with invalid JSON', async () => {
    try {
      await got(ctx.url('/api/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: `{"message":Invalid"}`
      });
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(400);
      expect(error.response.body).toContain('Invalid JSON');
    }
  });

  test('should return error exceeded body limit', async () => {
    try {
      await got(ctx.url('/api/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(json)
      });
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(413);
      expect(error.response.body).toContain('Body exceeded 1mb limit');
    }
  });

  test('should parse bigger body then 1mb', async () => {
    const res = await got(ctx.url('/api/big-parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(json)
    });

    expect(res.statusCode).toEqual(200);
  });

  test('should parse urlencoded body', async () => {
    const body = {
      title: 'Shuvi',
      description: 'The React Framework for Production'
    };

    const formBody = Object.keys(body)
      .map(key => {
        // @ts-ignore
        return `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`;
      })
      .join('&');

    const res = await got(ctx.url('/api/parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-Form-urlencoded'
      },
      body: formBody
    });

    expect(JSON.parse(res.body)).toEqual({
      title: 'Shuvi',
      description: 'The React Framework for Production'
    });
  });

  test('should parse body in handler', async () => {
    const res = await got(ctx.url('/api/no-parsing'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify([{ title: 'Shuvi' }])
    });

    expect(JSON.parse(res.body)).toEqual([{ title: 'Shuvi' }]);
  });

  test('should parse body with config', async () => {
    const res = await got(ctx.url('/api/parsing'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify([{ title: 'Shuvi' }])
    });

    expect(JSON.parse(res.body)).toEqual({ message: 'Parsed body' });
  });

  test('should show friendly error for invalid redirect', async () => {
    try {
      await got.get(ctx.url('/api/redirect-error'));
    } catch (error: any) {
      expect(error.response.body).toContain(
        `Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`
      );
    }
  });

  test('should show friendly error in case of passing null as first argument redirect', async () => {
    try {
      await got.get(ctx.url('/api/redirect-null'));
    } catch (error: any) {
      expect(error.response.body).toContain(
        `Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`
      );
    }
  });

  test('should redirect with status code 307', async () => {
    const res = await got(ctx.url('/api/redirect-307'), {
      followRedirect: false
    });
    expect(res.statusCode).toEqual(307);
  });

  test('should redirect to login', async () => {
    try {
      await got(ctx.url('/api/redirect-307'), {
        followRedirect: true
      });
    } catch (error: any) {
      expect(error.response.requestUrl).toContain('/api/redirect-307');
      expect(error.response.url).toContain('/login');
    }
  });

  test('should redirect with status code 301', async () => {
    const res = await got(ctx.url('/api/redirect-301'), {
      followRedirect: false
    });
    expect(res.statusCode).toEqual(301);
  });

  test('should return empty query object', async () => {
    const res = await got.get(ctx.url('/api/query'));
    expect(JSON.parse(res.body)).toEqual({});
  });

  test('should parse query correctly', async () => {
    const res = await got.get(ctx.url('/api/query?a=1&b=2&a=3'));
    expect(JSON.parse(res.body)).toEqual({ a: ['1', '3'], b: '2' });
  });

  test('should return empty cookies object', async () => {
    const res = await got.get(ctx.url('/api/cookies'));
    expect(JSON.parse(res.body)).toEqual({});
  });

  test('should return cookies object', async () => {
    const res = await got(ctx.url('/api/cookies'), {
      headers: {
        Cookie: 'Shuvi=cool;'
      }
    });
    expect(JSON.parse(res.body)).toEqual({ Shuvi: 'cool' });
  });

  test('should return 200 on POST on pages', async () => {
    const res = await got(ctx.url('/user'), {
      method: 'GET',
      headers: {
        accept: 'text/html, */*'
      }
    });
    expect(res.statusCode).toEqual(200);
  });

  test('should return JSON on post on API', async () => {
    const res = await got(ctx.url('/api/blog?title=Shuvi'), {
      method: 'POST'
    });
    expect(JSON.parse(res.body)).toEqual([{ title: 'Shuvi' }]);
  });

  test('should return data on dynamic route', async () => {
    const res = await got(ctx.url('/api/post-1'));
    expect(JSON.parse(res.body)).toEqual({
      params: {
        post: 'post-1'
      },
      query: {}
    });
  });

  test('should work with dynamic params and search string', async () => {
    const res = await got(ctx.url('/api/post-1?val=1'));
    expect(JSON.parse(res.body)).toEqual({
      params: {
        post: 'post-1'
      },
      query: {
        val: '1'
      }
    });
  });

  test('should work with dynamic params and search string like lambda', async () => {
    const res = await got(ctx.url('/api/post-1?val=1'));
    const json = await JSON.parse(res.body);
    expect(json).toEqual({
      params: {
        post: 'post-1'
      },
      query: {
        val: '1'
      }
    });
  });

  test('should prioritize a non-dynamic page', async () => {
    const res = await got(ctx.url('/api/post-1/comments'));
    expect(JSON.parse(res.body)).toEqual([
      { message: 'Prioritize a non-dynamic api page' }
    ]);
  });

  test('should return data on dynamic nested route', async () => {
    const res = await got(ctx.url('/api/post-1/comment-1'));
    expect(JSON.parse(res.body)).toEqual({
      params: {
        comment: 'comment-1',
        post: 'post-1'
      },
      query: {}
    });
  });

  test('should 404 on optional dynamic api page', async () => {
    try {
      await got(ctx.url('/api/blog/543/comment'));
    } catch (error: any) {
      expect(error.response.statusCode).toEqual(404);
    }
  });

  test('should return data on dynamic optional nested route', async () => {
    const res = await got(ctx.url('/api/blog/post-1/comment/1'));
    expect(JSON.parse(res.body)).toEqual({
      params: {
        id: '1',
        post: 'post-1'
      },
      query: {}
    });
  });

  test('should return data matched with higher priority route', async () => {
    const res = await got(
      ctx.url('/api/traveling/random-comment/specific-comment')
    );
    expect(JSON.parse(res.body)).toEqual({
      params: {
        comment: 'random-comment',
        post: 'traveling'
      },
      query: {}
    });
  });

  test('should return data matched with splat route', async () => {
    const res = await got(
      ctx.url('/api/traveling/random-comment/specific-comment/more/info?lng=en')
    );
    expect(JSON.parse(res.body)).toEqual({
      params: {
        '*': 'specific-comment/more/info',
        comment: 'random-comment',
        post: 'traveling'
      },
      query: {
        lng: 'en'
      }
    });
  });

  test('should work with child_process correctly', async () => {
    const res = await got(ctx.url('/api/child-process'));
    expect(res.body).toBe('hi');
  });

  test('assets should have a high priority', async () => {
    const res = await got.get(ctx.url(`/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');
  });

  test('should show warning when the API resolves without ending the request in dev mode', async () => {
    const req = got(ctx.url('/api/test-no-end'));
    setTimeout(() => {
      req.cancel();
    }, 2000);
    try {
      await req;
    } catch (error) {
      console.log(error);
    }
    expect(stderr).toContain(
      `API resolved without sending a response for /api/test-no-end, this may result in stalled requests.`
    );
  });

  test('should not show warning when the API resolves and the response is piped', async () => {
    const startIdx = stderr.length > 0 ? stderr.length - 1 : stderr.length;
    await got(
      ctx.url(
        `/api/test-res-pipe?url=${encodeURIComponent(ctx.url('/api/query'))}`
      )
    );
    expect(stderr.substr(startIdx)).not.toContain(
      `API resolved without sending a response`
    );
  });

  test('should show false positive warning if not using externalResolver flag', async () => {
    const apiURL = '/api/external-resolver-false-positive';
    const res = await got(ctx.url(apiURL));
    expect(stderr).toContain(
      `API resolved without sending a response for ${apiURL}, this may result in stalled requests.`
    );
    expect(res.body).toBe('hello world');
  });

  describe('apiRoutes hmr', () => {
    test('should detect the changes and display it', async () => {
      const filePath = resolveFixture(
        'api-routes/src/routes/api/hmr-test/api.js'
      );
      let originalContent: string | undefined;
      let done = false;
      let page;

      const initialContent = 'test-1';
      const changedContent = 'test-2';

      try {
        originalContent = await readFile(filePath, 'utf8');

        page = await ctx.browser.page(ctx.url('/api/hmr-test'));
        // get url
        const href = await page.evaluate(() => {
          return location.href;
        });
        // fetch response
        const getContent = () => {
          return got.get(href).then(res => res.body);
        };
        // edit file
        const editedContent = originalContent.replace(
          initialContent,
          changedContent
        );
        // add the edited content
        await writeFile(filePath, editedContent, 'utf8');

        let responseContent = await waitForResponseChange(
          getContent,
          initialContent
        );

        expect(responseContent).toBe(changedContent);
        await writeFile(filePath, originalContent, 'utf-8');
        responseContent = await waitForResponseChange(
          getContent,
          changedContent
        );

        expect(responseContent).toBe(initialContent);

        done = true;
      } finally {
        if (!done && originalContent) {
          writeFileSync(filePath, originalContent, 'utf8');
        }
      }
    });
  });
});
