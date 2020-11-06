import React, { ErrorInfo } from 'react';
import { Dir } from '@shuvi/react-fs';
import IndexFile from './components/IndexFile';
import ViewFile from './components/ViewFile';
import EntryFile from './components/EntryFile';
import AppFile from './components/AppFile';
import Polyfill from './components/PolyfillFile';
import RoutesFile from './components/RoutesFile';
import UserFiles from './components/UserFiles';
import ApplicationFile from './components/ApplicationFile';
import PluginFile from './components/PluginFile';

function App() {
  return (
    <>
      <IndexFile />
      <EntryFile />
      <Dir name="core">
        <ApplicationFile />
        <ViewFile />
        <AppFile />
        <RoutesFile />
        <PluginFile />
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
