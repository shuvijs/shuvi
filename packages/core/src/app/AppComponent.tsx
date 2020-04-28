import React, { ErrorInfo, useEffect } from 'react';
import { Dir } from '@shuvi/react-fs';
import IndexFile from './components/IndexFile';
import BootstrapFile from './components/BootstrapFile';
import AppFile from './components/AppFile';
import Polyfill from './components/PolyfillFile';
import RoutesFile from './components/RoutesFile';
import UserFiles from './components/UserFiles';

function App() {
  return (
    <>
      <IndexFile />
      <Dir name="core">
        <BootstrapFile />
        <AppFile />
        <RoutesFile />
        <Polyfill />
      </Dir>
      <UserFiles />
    </>
  );
}

export default class AppContainer extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('error', error);
  }

  render() {
    return <App />;
  }
}
