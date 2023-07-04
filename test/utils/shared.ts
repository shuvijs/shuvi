export function wait(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function trim(s: TemplateStringsArray | string) {
  if (typeof s === 'string') {
    return s.trim().replace(/^\s+/gm, '');
  }
  return s.join('\n').trim().replace(/^\s+/gm, '');
}

export async function check<T>(
  getter: () => T | Promise<T>,
  until: (x: T) => boolean
): Promise<boolean> {
  let content: T;
  let lastErr: any;

  for (let tries = 0; tries < 30; tries++) {
    try {
      content = await getter();
      if (until(content)) {
        // found the content
        return true;
      }
      await wait(1000);
    } catch (err) {
      await wait(1000);
      lastErr = err;
    }
  }

  throw new Error('CHECK TIMED OUT: ' + lastErr);
}
