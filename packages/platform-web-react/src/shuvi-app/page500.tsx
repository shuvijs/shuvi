import React from 'react';
import Error, { ErrorProps } from './Error';

export default function Page404({
  title = '500: Server Error',
  errorCode = 500,
  errorDesc = 'Internal Server Error.'
}: ErrorProps) {
  return <Error title={title} errorCode={errorCode} errorDesc={errorDesc} />;
}
