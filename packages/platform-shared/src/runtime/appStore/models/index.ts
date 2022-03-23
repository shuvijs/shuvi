import { Models } from '@shuvi/redox';
import { error } from './error';

export interface RootModel extends Models<RootModel> {
  error: typeof error;
}

export const models: RootModel = { error };
