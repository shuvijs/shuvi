import * as React from 'react';

import { Overlay } from '../components';

export type BuildErrorProps = { errors: string };

export const BuildError: React.FC<BuildErrorProps> = function BuildError({
  errors
}) {
  return <Overlay>Build Error {errors}</Overlay>;
};
