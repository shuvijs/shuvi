import * as React from 'react';
import { IPageError } from '@shuvi/platform-shared/esm/runtime';
import error from './Error';
// @ts-ignore
import UserError from '@shuvi/app/core/error';

const Error = UserError || error;

export default function ErrorPage({
  errorCode,
  errorDesc
}: Omit<IPageError, 'hasError'>) {
  return <Error errorCode={errorCode} errorDesc={errorDesc} />;
}
