import React from 'react';
import { IAppState, DEFAULT_ERROR_MESSAGE } from '@shuvi/platform-core';
import error from './ErrorComp';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

export default function ErrorPage({
  errorCode,
  errorDesc
}: IAppState['error']) {
  const defaultErrorMessage = DEFAULT_ERROR_MESSAGE[errorCode!];
  if (defaultErrorMessage) {
    if (errorDesc === undefined) errorDesc = defaultErrorMessage.errorDesc;
  }
  return <Error errorCode={errorCode} errorDesc={errorDesc} />;
}
