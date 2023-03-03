import { ApplicationImpl } from '../shared/application';
import { ApplicationlOptions } from './shared';

export { ApplicationImpl };

export default function application<C extends {}>(
  options: ApplicationlOptions<C>
): ApplicationImpl<C> {
  const application = new ApplicationImpl({
    ...options,
    getLoaders: () => Promise.resolve({})
  });

  return application;
}
