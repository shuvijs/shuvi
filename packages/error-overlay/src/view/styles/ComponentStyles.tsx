import { styles as dialog } from '../components/Dialog';
import { styles as NavigationBar } from '../components/NavigationBar';
import { styles as overlay } from '../components/Overlay';
import { styles as terminal } from '../components/Terminal';
import { styles as toast } from '../components/Toast';
import { styles as errors } from '../components/Errors';
import { styles as buildErrorStyles } from '../container/BuildError';
import { styles as runtimeErrorStyles } from '../container/RuntimeError';
import { noop as css } from '../helpers/noop-template';

export function ComponentStyles() {
  return (
    <style>
      {css`
        ${overlay}
        ${toast}
        ${dialog}
        ${NavigationBar}
        ${terminal}
        ${errors}

        ${buildErrorStyles}
        ${runtimeErrorStyles}
      `}
    </style>
  );
}
