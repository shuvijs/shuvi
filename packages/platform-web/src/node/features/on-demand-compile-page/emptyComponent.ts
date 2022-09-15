import logger from '@shuvi/utils/lib/logger';

export default function () {
  logger.warn('You should compile the module before using it.');
  return null;
}
