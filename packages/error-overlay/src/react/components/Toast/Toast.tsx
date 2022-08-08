import * as React from 'react';

export type ToastProps = {
  onClick?: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
  children: React.ReactNode;
};

export const Toast: React.FC<ToastProps> = function Toast({
  onClick,
  children,
  className
}) {
  return (
    <div data-toast onClick={onClick} className={className}>
      <div data-toast-wrapper>{children}</div>
    </div>
  );
};
