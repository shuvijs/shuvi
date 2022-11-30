const REGEXP_DIRECTORY_TESTS = /[\\/]__(tests|mocks)__[\\/]/i;
const REGEXP_FILE_TEST = /\.(?:spec|test)\.[^.]+$/i;

const EVENT_BUILD_OPTIMIZED = 'SHUVI_BUILD_OPTIMIZED';
type EventBuildOptimized = {
  durationInSeconds: number;
  totalPageCount: number;
  hasTestPages: boolean;
  hasStatic404: boolean;
  middlewareCount: number;
  totalLoaderCount: number;
  useTypeScript: boolean;
};

export function eventBuildOptimize(
  routePaths: string[],
  event: Omit<EventBuildOptimized, 'totalPageCount' | 'hasTestPages'>
): {
  eventName: string;
  payload: EventBuildOptimized;
} {
  return {
    eventName: EVENT_BUILD_OPTIMIZED,
    payload: {
      ...event,
      totalPageCount: routePaths.filter(path => /page\..*/i.test(path)).length,
      hasTestPages: routePaths.some(
        path => REGEXP_DIRECTORY_TESTS.test(path) || REGEXP_FILE_TEST.test(path)
      )
    }
  };
}
