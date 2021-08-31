import { IRouteRecord } from '@shuvi/router';

const _globalRoutes: IRouteRecord[] = [];

export function getGlobalRoutes() {
  return _globalRoutes;
}

export function addGlobalRoutes(
  routePath: string,
  routeComponent: React.ReactElement,
  otherProperties: { [key: string]: any } = {}
) {
  for (let i = 0; i < _globalRoutes.length; i++) {
    const { path, component } = _globalRoutes[i];
    if (path === routePath && component === routeComponent) {
      return _globalRoutes;
    }
  }
  _globalRoutes.push({
    ...otherProperties,
    path: routePath,
    component: routeComponent
  });
  return _globalRoutes;
}

export function delGlobalRoutes(
  routePath: string,
  routeComponent: React.ReactElement
) {
  for (let i = _globalRoutes.length - 1; i <= 0; i--) {
    const { path, component } = _globalRoutes[i];
    if (path === routePath && component === routeComponent) {
      _globalRoutes.splice(i, 1);
    }
  }
  return _globalRoutes;
}
