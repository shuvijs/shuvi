import React from 'react';
import PageError from './pageError';
import { IPageError, ShuviErrorCode } from '@shuvi/router';

export default function page404({ title, errorCode, errorDesc }: IPageError) {
  return (
    <PageError
      title={title || '404: Page not found'}
      errorCode={errorCode || ShuviErrorCode.PAGE_NOT_FOUND}
      errorDesc={errorDesc || 'This page could not be found.'}
    />
  );
}
