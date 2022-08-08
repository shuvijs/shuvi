import * as React from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader
} from '../components/Dialog';
import { Overlay } from '../components/Overlay';
import { Terminal } from '../components/Terminal';
import { noop as css } from '../helpers/noop-template';

export type BuildErrorProps = { error: string };

export const BuildError: React.FC<BuildErrorProps> = function BuildError({
  error
}) {
  const noop = React.useCallback(() => {}, []);
  return (
    <Overlay fixed>
      <Dialog
        type="error"
        onClose={noop}
        aria-labelledby="build_error_label"
        aria-describedby="build_error_desc"
      >
        <DialogContent>
          <DialogHeader className="container-build-error-header">
            <h4>Failed to compile</h4>
          </DialogHeader>
          <DialogBody className="container-build-error-body">
            <Terminal content={error} />
            <footer>
              <small>
                This error occurred during the build process and can only be
                dismissed by fixing the error.
              </small>
            </footer>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Overlay>
  );
};

export const styles = css`
  .container-build-error-header > h4 {
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .container-build-error-body footer {
    margin-top: var(--size-gap);
  }
  .container-build-error-body footer p {
    margin: 0;
  }

  .container-build-error-body small {
    color: #757575;
  }
`;
