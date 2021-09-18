import { createFactory } from './create-application-factory';
import { createMemoryHistory } from '@shuvi/router';

export const create = createFactory(createMemoryHistory);
