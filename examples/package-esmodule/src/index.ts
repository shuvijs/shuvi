import { consoleLog } from './utils.js';

export default (data?: string) => {
  consoleLog(`Hello from package-esmodule ${data}`);

  if (typeof window !== 'undefined') {
    consoleLog('[package-esmodule] Running in the browser');
  }
};
