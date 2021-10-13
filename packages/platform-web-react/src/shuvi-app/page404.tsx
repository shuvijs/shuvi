import React from 'react';
import Error, { ErrorProps } from './Error';

export default function Page404({
  title = '404: Page not found',
  errorCode = 404,
  errorDesc = 'This page could not be found.'
}: ErrorProps) {
  return <Error title={title} errorCode={errorCode} errorDesc={errorDesc} />;
}
