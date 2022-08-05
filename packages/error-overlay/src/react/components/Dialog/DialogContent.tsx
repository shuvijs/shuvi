import * as React from 'react';

export type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

const DialogContent: React.FC<DialogContentProps> = function DialogContent({
  children,
  className
}) {
  return (
    <div dialog-content className={className}>
      {children}
    </div>
  );
};

export { DialogContent };
