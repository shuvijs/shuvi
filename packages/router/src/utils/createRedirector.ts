import { Runtime } from '@shuvi/types';

interface IRedirector {
  redirected: boolean;
  state?: Runtime.IRedirectState;
  handler: Runtime.IRedirectFn;
}

export function createRedirector(): IRedirector {
  const redirector = {
    redirected: false,
    state: undefined
  } as IRedirector;

  redirector.handler = (first?: number | string, second?: string) => {
    if (redirector.redirected) {
      return;
    }

    if (!first) {
      return;
    }

    let firstType = typeof first;
    let secondType = typeof second;
    if (firstType === 'number' && secondType === 'string') {
      redirector.redirected = true;
      redirector.state = {
        status: first as number,
        path: second as string
      };
    } else if (firstType === 'string' && secondType === 'undefined') {
      redirector.redirected = true;
      redirector.state = {
        path: first as string
      };
    }
  };

  return redirector;
}
