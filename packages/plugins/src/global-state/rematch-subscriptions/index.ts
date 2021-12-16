import { Action, Model, Plugin, Models } from '@rematch/core';
import { createSubscription } from './create';
import { createUnsubscribe } from './unsubscribe';
import { IMatched, IMatchedMap } from './types';

const subscriptionsPlugin = <
  TModels extends Models<TModels>,
  TExtraModels extends Models<TModels>
>(): Plugin<TModels, TExtraModels> => {
  const subscriptions: IMatchedMap = new Map();
  const patternSubscriptions: IMatchedMap = new Map();
  const triggerAllSubscriptions = (matches: IMatched) => (matcher: string) => {
    // call each subscription in each model
    Object.keys(matches).forEach((modelName: string) => {
      // create subscription with (unsubscribe)
      matches[modelName](() =>
        createUnsubscribe(
          modelName,
          matcher,
          subscriptions,
          patternSubscriptions
        )()
      );
    });
  };
  return {
    onModel(
      model: Model<TModels> & {
        name: string;
        _subscriptions?: Record<string, () => void>;
      }
    ) {
      // a list of actions is only necessary
      // to create warnings for invalid subscription names
      Object.keys(model._subscriptions || {}).forEach((matcher: string) => {
        const onAction = model._subscriptions && model._subscriptions[matcher];
        onAction &&
          createSubscription(
            model.name,
            matcher,
            onAction,
            subscriptions,
            patternSubscriptions
          );
      });
    },
    createMiddleware(rematchBag) {
      return store => (next: (action: Action) => any) => (action: Action) => {
        const { type } = action;
        console.log(action, 'action');
        next(action);
        // exact match
        if (subscriptions.has(type)) {
          const allMatches = subscriptions.get(type);
          // call each hook[modelName] with action
          allMatches && triggerAllSubscriptions(allMatches)(type);
        } else {
          patternSubscriptions.forEach((handler: object, matcher: string) => {
            if (type.match(new RegExp(matcher))) {
              const patternMatches = patternSubscriptions.get(matcher);
              patternMatches &&
                triggerAllSubscriptions(patternMatches)(matcher);
            }
          });
        }
      };
    }
  };
};

export default subscriptionsPlugin;
