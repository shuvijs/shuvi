import * as React from 'react';
import error from './ErrorComp';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

export default function ErrorPage({
  code,
  message
}: {
  code?: number;
  message?: string;
}) {
  return <Error errorCode={code} errorDesc={message} />;
}
