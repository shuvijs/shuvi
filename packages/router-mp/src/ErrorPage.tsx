import React from 'react';
import { IPageError, DEFAULTERRORMESSAGE } from '@shuvi/router';
import error from './Error';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Error = userError || error;

export default function ErrorPage({ errorCode, errorDesc }: IPageError) {
  const defaultErrorMessage = DEFAULTERRORMESSAGE[errorCode!];
  if(defaultErrorMessage){
    if(errorDesc === undefined) errorDesc = defaultErrorMessage.errorDesc;
  }
  return <Error errorCode={errorCode} errorDesc={errorDesc} />
}
