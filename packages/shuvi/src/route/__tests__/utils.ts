import path from 'path';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export function resolveFixtureFile(name: string, file: string) {
  return path.join(resolveFixture(name), file);
}

export function sortByPath(routes: any[]) {
  const res = routes.slice().sort((a, b) => a.path.localeCompare(b.path));
  res.forEach(route => {
    if (route.routes) {
      route.routes = sortByPath(route.routes);
    }
  });
  return res;
}
