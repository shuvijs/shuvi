import * as React from 'react';

import { Overlay } from '../components';

export type RuntimeErrorProps = { errors: string };

export const RuntimeError: React.FC<RuntimeErrorProps> = function RuntimeError({
  errors
}) {
  return <Overlay>Runtime Error {errors}</Overlay>;
};
