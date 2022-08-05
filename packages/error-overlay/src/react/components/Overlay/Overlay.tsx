// @ts-ignore
import allyTrap from './maintain--tab-focus';
import * as React from 'react';
import { lock, unlock } from './body-locker';

export type OverlayProps = {
  className?: string;
  fixed?: boolean;
  children: React.ReactNode;
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

  const [overlay, setOverlay] = React.useState<HTMLDivElement | null>(null);
  const onOverlay = React.useCallback((el: HTMLDivElement) => {
    setOverlay(el);
  }, []);

  React.useEffect(() => {
    if (overlay == null) {
      return;
    }

    const handle2 = allyTrap({ context: overlay });
    return () => {
      handle2.disengage();
    };
  }, [overlay]);

  return (
    <div dialog-overlay className={className} ref={onOverlay}>
      <div dialog-backdrop dialog-backdrop-fixed={fixed ? true : undefined} />
      {children}
    </div>
  );
};

export { Overlay };
