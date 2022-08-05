import * as React from 'react';

export type OverlayProps = {
  className?: string;
  fixed?: boolean;
  children: React.ReactNode;
};

export const Overlay: React.FC<OverlayProps> = function Overlay({ children }) {
  return <div>{children}</div>;
};
