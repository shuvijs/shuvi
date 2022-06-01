import {
  createRouter,
  MemoryHistory,
  IRouteRecord,
  InitialEntry
} from '@shuvi/router';

export function createMockRouter(
  routes: IRouteRecord[],
  initialLocation: InitialEntry
) {
  return createRouter({
    routes,
    history: new MemoryHistory({
      initialEntries: [initialLocation],
      initialIndex: 0
    })
  });
}
