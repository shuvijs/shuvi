import React from 'react';
import { View } from '@tarojs/components';
import { IPageError } from '@shuvi/platform-core';

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

export default function error({ errorCode, errorDesc }: IPageError) {
  return (
    <View style={style.container}>
      <View style={style.error}>
        <View style={style.errorCode}>{errorCode}</View>
        {errorDesc && <View style={style.errorDesc}>{errorDesc}</View>}
      </View>
    </View>
  );
}
