import React from 'react';
import { IPageError, ShuviErrorCode } from '@shuvi/router';
import { page404, page500, pageError } from './error-pages';
// @ts-ignore
import usePage404 from '@shuvi/app/core/404';
// @ts-ignore
import userPage500 from '@shuvi/app/core/500';
// @ts-ignore
import userError from '@shuvi/app/core/error';

const Page404 = usePage404 || page404;
const Page500 = userPage500 || page500;
const Error = userError || pageError;

export default function ErrorPage({ title, errorCode, errorDesc }: IPageError) {
  switch (errorCode) {
    case ShuviErrorCode.APP_ERROR:
      return (
        <Page500 errorCode={errorCode} title={title} errorDesc={errorDesc} />
      );
    case ShuviErrorCode.PAGE_NOT_FOUND:
      return (
        <Page404 errorCode={errorCode} title={title} errorDesc={errorDesc} />
      );
    default:
      return (
        <Error errorCode={errorCode} title={title} errorDesc={errorDesc} />
      );
  }
}
