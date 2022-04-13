import React from 'react';
import { IPageError } from '@shuvi/platform-shared/esm/runtime';
import { DEFAULT_ERROR_MESSAGE } from '@shuvi/shared/lib/constants';
import error from './ErrorComp';
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
