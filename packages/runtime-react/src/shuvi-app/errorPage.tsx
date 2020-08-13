import React from 'react';
import { Head } from '@shuvi/app';
import { Runtime } from '@shuvi/types';
import { IError } from '@shuvi/core';

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

interface IErrorProps {
  error: IError;
}

const ErrorPage: Runtime.IErrorComponent<React.FC<IErrorProps>> = ({
  error
}) => {
  if (!error) {
    return (
      <div style={style.container}>
        <Head>
          <title>404: Page not found</title>
        </Head>

        <div style={style.error}>
          <div style={style.errorCode}>404</div>
          <div style={style.errorDesc}>Page not found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={style.container}>
      <Head>
        <title>500: Server Error</title>
      </Head>

      <div style={style.error}>
        <div style={style.errorCode}>500</div>
        <div style={style.errorDesc}>Internal Server Error</div>
      </div>
    </div>
  );
};

export default ErrorPage;
