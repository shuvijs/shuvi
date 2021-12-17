import { onHandlers } from './handlers';
import { IMatchedMap } from './types';

export const createSubscription = (
  modelName: string,
  matcher: string,
  onAction: (unsubscribe: () => void) => void,
  subscriptions: IMatchedMap,
  patternSubscriptions: IMatchedMap
) => {
  const createHandler = (target: IMatchedMap, formattedMatcher: string) => {
    // handlers match on { modelName: onAction }
    // to allow multiple subscriptions in different models
    let handler = { [modelName]: onAction };
    if (target.has(formattedMatcher)) {
      handler = { ...target.get(formattedMatcher), ...handler };
    }
    target.set(formattedMatcher, handler);
  };

  onHandlers(createHandler, subscriptions, patternSubscriptions)(matcher);
};
