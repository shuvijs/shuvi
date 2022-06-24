import { getApiRoutes } from '../route';
import { getFixturePath, normalizePath, normalizeWarnings } from './utils';

const getFixtureApiRoutes = async (dirname: string) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getApiRoutes(dir);

  return {
    routes: normalizePath(routes, dir, 'filepath'),
    warnings: normalizeWarnings(warnings, dir),
    errors: normalizeWarnings(errors, dir)
  };
};

describe('api routes test', () => {
  it('should get correct api routes', async () => {
    const result = await getFixtureApiRoutes('api');

    expect(result).toMatchObject({
      routes: [
        {
          path: '/api',
          filepath: 'api/api.js'
        },
        {
          path: '/api/users/:id',
          filepath: 'api/users/[id]/api.js'
        },
        {
          path: '/api/users',
          filepath: 'api/users/api.js'
        }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should get warnings and dont generate apis when conflicted', async () => {
    const result = await getFixtureApiRoutes('api-conflict');
    expect(result).toMatchObject({
      routes: [],
      warnings: [
        {
          type: 'api',
          msg: 'Find both layout.js and api.js in "a"!, only "layout.js" is used.'
        },
        {
          type: 'api',
          msg: 'Find both layout.js and api.js in "b"!, only "layout.js" is used.'
        }
      ],
      errors: []
    });
  });
});
