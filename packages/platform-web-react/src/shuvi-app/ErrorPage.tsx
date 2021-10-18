import React from 'react';
import { IPageError, ShuviErrorCode } from '@shuvi/router';
import error from './Error';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

const DEFAULTERRORMESSAGE = {
  [ShuviErrorCode.APP_ERROR]: {
    errorDesc: 'Internal Server Error.',
  },
  [ShuviErrorCode.PAGE_NOT_FOUND]: {
    errorDesc: 'This page could not be found.',
  }
}

export default function ErrorPage({ errorCode, errorDesc }: IPageError) {
  const defaultErrorMessage = DEFAULTERRORMESSAGE[errorCode!];
  if(defaultErrorMessage){
    if(errorDesc === undefined) errorDesc = defaultErrorMessage.errorDesc;
  }
  return <Error errorCode={errorCode} errorDesc={errorDesc} />
}
