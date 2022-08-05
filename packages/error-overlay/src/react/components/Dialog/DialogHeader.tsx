import * as React from 'react';

export type DialogHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

const DialogHeader: React.FC<DialogHeaderProps> = function DialogHeader({
  children,
  className
}) {
  return (
    <div dialog-header className={className}>
      {children}
    </div>
  );
};

export { DialogHeader };
