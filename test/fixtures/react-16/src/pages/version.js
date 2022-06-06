import { version } from 'react';
import { version as domVersion } from 'react-dom';

export default () => {
  return (
    <div id="version">
      <div id="reactVersion">{ version }</div>
      <div id="domVersion">{ domVersion }</div>
    </div>
  );
}
