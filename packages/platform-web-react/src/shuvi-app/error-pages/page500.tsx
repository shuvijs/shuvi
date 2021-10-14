import React from 'react';
import PageError from './pageError';
import { IPageError, ShuviErrorCode } from '@shuvi/router';

export default function page404({ title, errorCode, errorDesc }: IPageError) {
  return (
    <PageError
      title={title || '500: Server Error'}
      errorCode={errorCode || ShuviErrorCode.APP_ERROR}
      errorDesc={errorDesc || 'Internal Server Error.'}
    />
  );
}
