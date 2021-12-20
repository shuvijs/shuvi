import { onHandlers } from './handlers';
import omit from './omit';
import { IMatchedMap } from './types';

const unsubscribeFrom =
  (modelName: string) => (target: IMatchedMap, formattedMatcher: string) => {
    const handler = target.get(formattedMatcher);
    const next = omit(modelName, handler || {});
    if (Object.keys(next).length) {
      // still other hooks under matcher
      target.set(formattedMatcher, next);
    } else {
      // no more hooks under matcher
      target.delete(formattedMatcher);
    }
  };

// creates an unsubscribe function that can be called within a model
export const createUnsubscribe =
  (
    modelName: string,
    matcher: string,
    subscriptions: IMatchedMap,
    patternSubscriptions: IMatchedMap
  ) =>
  () => {
    onHandlers(
      unsubscribeFrom(modelName),
      subscriptions,
      patternSubscriptions
    )(matcher);
  };
