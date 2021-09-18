import { createFactory } from './create-application-factory';
import { createHashHistory } from '@shuvi/router';

export const create = createFactory(createHashHistory);
