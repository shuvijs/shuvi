import type { IRouter } from '@shuvi/router';
import { getPublicPath } from './getPublicPath';

function hasSupportPrefetch() {
  try {
    const link: HTMLLinkElement = document.createElement('link');
    return link.relList.supports('prefetch');
  } catch (e) {
    return false;
  }
}

function prefetchViaDom(
  { href, id }: any,
  as: string,
  link?: HTMLLinkElement
): Promise<any> {
  return new Promise<void>((res, rej) => {
    const selector = `
        link[rel="prefetch"][href^="${href}"],
        script[src^="${href}"]`;
    if (document.querySelector(selector)) {
      return res();
    }

    link = document.createElement('link');

    // The order of property assignment here is intentional:
    if (as) link!.as = as;
    link!.rel = `prefetch`;
    link!.onload = res as any;
    link!.onerror = rej;
    link.dataset.id = id;

    // `href` should always be last:
    link!.href = href;

    document.head.appendChild(link);
  });
}

function getFilesForRoute(
  route: string,
  filesByRoutId: Record<string, string[]>,
  router: IRouter,
  publicPath: string
): any {
  let allFiles: any[] = [];
  const targetRoute = router.match(route);
  if (!filesByRoutId || !targetRoute?.length) {
    throw new Error(`Failed to lookup route: ${route}`);
  }

  targetRoute.forEach(({ route: { id } }) => {
    allFiles.push(
      ...filesByRoutId[id].map(path => ({
        href: getPublicPath(path, publicPath),
        id
      }))
    );
  });

  return {
    scripts: allFiles.filter(({ href }) => href.endsWith('.js')),
    css: allFiles.filter(({ href }) => href.endsWith('.css'))
  };
}

export async function prefetchFn(
  route: string,
  filesByRoutId: Record<string, string[]>,
  router: IRouter,
  publicPath: string
): Promise<Promise<void> | void> {
  if (process.env.NODE_ENV !== 'production') return;
  if (typeof window === 'undefined' || !route) return;
  const output = await getFilesForRoute(
    route,
    filesByRoutId,
    router,
    publicPath
  );
  const canPrefetch: boolean = hasSupportPrefetch();
  await Promise.all(
    canPrefetch
      ? output.scripts.map((script: { toString: () => string }) =>
          prefetchViaDom(script, 'script')
        )
      : []
  );
}

export const isAbsoluteUrl = (url: string) => {
  const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
  return ABSOLUTE_URL_REGEX.test(url);
};
