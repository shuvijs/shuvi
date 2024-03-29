import * as React from 'react';
import error from './Error';
import userError from '@shuvi/app/user/error';

const Error = userError || error;

export default function ErrorPage({
  code,
  message,
  error
}: {
  code?: number;
  message?: string;
  error?: Error;
}) {
  return <Error errorCode={code} errorDesc={message} error={error} />;
}
