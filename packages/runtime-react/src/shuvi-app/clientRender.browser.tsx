import { createBrowserHistory } from './router/history';
import { createClientRenderer } from './createClientRenderer';

export const renderer = createClientRenderer({
  historyCreator: createBrowserHistory
});
