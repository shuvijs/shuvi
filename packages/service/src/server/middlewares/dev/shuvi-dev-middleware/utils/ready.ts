import { IContext, ICallback } from '../types';

export default function ready(context: IContext, callback: ICallback) {
  if (context.state) {
    return callback(context.stats);
  }
  context.callbacks.push(callback);
}
