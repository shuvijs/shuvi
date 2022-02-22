import React from 'react';
import { IAppState } from '@shuvi/platform-core';
import { DEFAULT_ERROR_MESSAGE } from '@shuvi/shared/lib/constants';
import error from './Error';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

export default function ErrorPage({
  errorCode,
  errorDesc
}: Omit<IAppState['error'], 'hasError'>) {
  const defaultErrorMessage = DEFAULT_ERROR_MESSAGE[errorCode!];
  if (defaultErrorMessage) {
    if (errorDesc === undefined) errorDesc = defaultErrorMessage.errorDesc;
  }
  return <Error errorCode={errorCode} errorDesc={errorDesc} />;
}
