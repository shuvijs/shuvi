import React from 'react';
import { IPageError, DEFAULT_ERROR_MESSAGE } from '@shuvi/platform-core';
import error from './Error';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

export default function ErrorPage({ errorCode, errorDesc }: IPageError) {
  const defaultErrorMessage = DEFAULT_ERROR_MESSAGE[errorCode!];
  if (defaultErrorMessage) {
    if (errorDesc === undefined) errorDesc = defaultErrorMessage.errorDesc;
  }
  return <Error errorCode={errorCode} errorDesc={errorDesc} />;
}
