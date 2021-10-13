import React from 'react';
// @ts-ignore
import { Head } from './head';

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
    borderRight: '1px solid rgba(0, 0, 0, 0.3)',
    paddingRight: '20px',
    marginRight: '20px',
    fontSize: '24px',
    fontWeight: 500
  },
  errorDesc: { fontSize: '16px', lineHeight: '1' }
} as const;

export interface ErrorProps {
  title: string;
  errorCode: number;
  errorDesc: string;
}

export default function Error({
  title = '',
  errorCode = 500,
  errorDesc = ''
}: ErrorProps) {
  return (
    <div style={style.container}>
      <Head>
        <title>{title}</title>
      </Head>

      <div style={style.error}>
        {errorCode && <div style={style.errorCode}>{errorCode}</div>}
        {errorDesc && <div style={style.errorDesc}>{errorDesc}</div>}
      </div>
    </div>
  );
}
