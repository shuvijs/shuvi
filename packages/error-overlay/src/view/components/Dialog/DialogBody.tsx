import * as React from 'react';

export type DialogBodyProps = {
  className?: string;
  children: React.ReactNode;
};

const DialogBody: React.FC<DialogBodyProps> = function DialogBody({
  children,
  className
}) {
  return (
    <div data-dialog-body className={className}>
      {children}
    </div>
  );
};

export { DialogBody };
