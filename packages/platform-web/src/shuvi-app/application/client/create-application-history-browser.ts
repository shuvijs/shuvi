import { createFactory } from './create-application-factory';
import { createBrowserHistory } from '@shuvi/router';

export const create = createFactory(createBrowserHistory);
