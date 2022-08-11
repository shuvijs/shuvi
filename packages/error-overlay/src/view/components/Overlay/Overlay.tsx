import * as React from 'react';
import { lock, unlock } from './body-locker';

export type OverlayProps = {
  className?: string;
  fixed?: boolean;
  children?: React.ReactNode;
};

const Overlay: React.FC<OverlayProps> = function Overlay({
  className,
  children,
  fixed
}) {
  React.useEffect(() => {
    lock();
    return () => {
      unlock();
    };
  }, []);

  return (
    <div data-dialog-overlay className={className}>
      <div
        data-dialog-backdrop
        data-dialog-backdrop-fixed={fixed ? true : undefined}
      />
      {children}
    </div>
  );
};

export { Overlay };
