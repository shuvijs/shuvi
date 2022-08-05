import * as React from 'react';

import { styles as dialog } from '../components/Dialog';
import { styles as overlay } from '../components/Overlay/styles';
import { styles as terminal } from '../components/Terminal/styles';
import { styles as buildErrorStyles } from '../container/BuildError';
import { noop as css } from '../helpers/noop-template';

export function ComponentStyles() {
  return (
    <style>
      {css`
        ${overlay}
        ${dialog}
        ${terminal}
        
        ${buildErrorStyles}
      `}
    </style>
  );
}
