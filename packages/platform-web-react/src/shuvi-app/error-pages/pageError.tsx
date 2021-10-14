import React from 'react';
import { IPageError, ShuviErrorCode } from '@shuvi/router';
// @ts-ignore
import { Head } from '../head';

const style = {
  container: {
    color: '#000',
    background: '#fff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  errorCode: {
    fontSize: '24px',
    fontWeight: 500
  },
  errorDesc: {
    fontSize: '16px',
    lineHeight: '1',
    borderLeft: '1px solid rgba(0, 0, 0, 0.3)',
    paddingLeft: '20px',
    marginLeft: '20px'
  }
} as const;

export default function pageError({
  title = '',
  errorCode,
  errorDesc = ''
}: IPageError) {
  return (
    <div style={style.container}>
      <Head>
        <title>{title}</title>
      </Head>

      <div style={style.error}>
        <div style={style.errorCode}>
          {errorCode || ShuviErrorCode.APP_ERROR}
        </div>
        {errorDesc && <div style={style.errorDesc}>{errorDesc}</div>}
      </div>
    </div>
  );
}
