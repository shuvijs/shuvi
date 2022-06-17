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

function getFilesForRoute(route: string): Promise<any> {
  return Promise.resolve(self.__SHUVI_MANIFEST).then(manifest => {
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

export default async function prefetchFn(
  route: string
): Promise<Promise<void> | void> {
  if (process.env.NODE_ENV !== 'production') return;
  if (typeof window === 'undefined' || !route) return;
  const output = await getFilesForRoute(route);
  const canPrefetch: boolean = hasSupportPrefetch();
  await Promise.all(
    canPrefetch
      ? output.scripts.map((script: { toString: () => string }) =>
          prefetchViaDom(script.toString(), 'script')
        )
      : []
  );
}
