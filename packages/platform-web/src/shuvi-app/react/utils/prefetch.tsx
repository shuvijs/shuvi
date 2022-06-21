function hasSupportPrefetch() {
  try {
    const link: HTMLLinkElement = document.createElement('link');
    return link.relList.supports('prefetch');
  } catch (e) {
    return false;
  }
}

function prefetchViaDom(
  href: string,
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

    // `href` should always be last:
    link!.href = href;

    document.head.appendChild(link);
  });
}

function getFilesForRoute(
  route: string,
  clientManifestPath: Record<string, string[]>
): Promise<any> {
  return Promise.resolve(clientManifestPath).then(manifest => {
    if (!manifest || !(route in manifest)) {
      throw new Error(`Failed to lookup route: ${route}`);
    }

    const allFiles = manifest[route].map(entry => encodeURI(entry));

    return {
      scripts: allFiles.filter(v => v.endsWith('.js')),
      css: allFiles.filter(v => v.endsWith('.css'))
    };
  });
}

export async function prefetchFn(
  route: string,
  clientManifestPath: Record<string, string[]>
): Promise<Promise<void> | void> {
  if (process.env.NODE_ENV !== 'production') return;
  if (typeof window === 'undefined' || !route) return;
  const output = await getFilesForRoute(route, clientManifestPath);
  const canPrefetch: boolean = hasSupportPrefetch();
  await Promise.all(
    canPrefetch
      ? output.scripts.map((script: { toString: () => string }) =>
          prefetchViaDom(script.toString(), 'script')
        )
      : []
  );
}

export const isAbsoluteUrl = (url: string) => {
  const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
  return ABSOLUTE_URL_REGEX.test(url);
};
