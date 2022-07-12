import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View } from '@tarojs/components';
import { IError } from '@shuvi/platform-shared/shared';
import { ViewProps } from '@tarojs/components/types/View';

type ViewType = React.FC<PropsWithChildren<ViewProps>>;
const TypedView: ViewType = View as ViewType;

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

export default function error({ code, message }: IError) {
  return (
    <TypedView style={style.container}>
      <TypedView style={style.error}>
        <TypedView style={style.errorCode}>{code}</TypedView>
        <TypedView style={style.errorDesc}>{message || 'Error'}</TypedView>
      </TypedView>
    </TypedView>
  );
}
