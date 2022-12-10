import findUp from 'find-up';

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

const EVENT_PACKAGE_DETECTED = 'SHUVI_PACKAGE_DETECTED';
type EventPackageDetected = {
  eventName: string;
  payload: {
    packageName: string;
    packageVersion: string;
  };
};

export async function eventPackageDetected(
  dir: string
): Promise<Array<EventPackageDetected>> {
  try {
    const packageJsonPath = await findUp('package.json', { cwd: dir });
    if (!packageJsonPath) {
      return [];
    }

    const {
      dependencies = {},
      devDependencies = {}
    } = require(packageJsonPath);

    const deps = { ...devDependencies, ...dependencies };

    return Object.keys(deps).reduce(
      (
        events: EventPackageDetected[],
        plugin: string
      ): EventPackageDetected[] => {
        const version = deps[plugin];
        // Don't add deps without a version set
        if (!version) {
          return events;
        }

        events.push({
          eventName: EVENT_PACKAGE_DETECTED,
          payload: {
            packageName: plugin,
            packageVersion: version
          }
        });

        return events;
      },
      []
    );
  } catch (_) {
    return [];
  }
}
