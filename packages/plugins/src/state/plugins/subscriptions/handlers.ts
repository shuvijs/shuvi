import { IMatchedMap } from './types';

// matches actions with letter/number characters & -, _
const actionRegex = /^[A-Z0-9-_]+\/[A-Z0-9-_]+$/i;
// valid pattern match: letters/numbers &_-, *
// match on 'a/*', '*/b', 'a-*/b', etc.
// note: cannot match * or creates infinite loop`
const patternRegex = /^[A-Z0-9-_*]+\/[A-Z0-9-_*]+$/i;

const escapeRegex = (str: string) => str.replace(/\*/g, '.*');

const isAction = (matcher: string, regex: RegExp) => !!matcher.match(regex);

export const onHandlers =
  (
    call: (sub: IMatchedMap, matcher: string) => any,
    subscriptions: IMatchedMap,
    patternSubscriptions: IMatchedMap
  ) =>
  (matcher: string) => {
    if (isAction(matcher, actionRegex)) {
      // exact match on create or unsubscribe
      call(subscriptions, matcher);
    } else if (isAction(matcher, patternRegex)) {
      // pattern match on create
      const formattedMatcher = `^${escapeRegex(matcher)}$`;
      call(patternSubscriptions, formattedMatcher);
    } else if (matcher[0] === '^') {
      // pattern match, already formatted. Called by unsubscribe
      // NOTE: this should probably live elsewhere
      call(patternSubscriptions, matcher);
    } else {
      throw new Error(`Invalid subscription matcher: ${matcher}`);
    }
  };
