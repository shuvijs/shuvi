import { ApplicationImpl } from '../shared/application';
import { ApplicationOptions } from './shared';

export { ApplicationImpl };

export default function application<C extends {}>(
  options: ApplicationOptions<C>
): ApplicationImpl<C> {
  const application = new ApplicationImpl({
    ...options
  });

  return application;
}
