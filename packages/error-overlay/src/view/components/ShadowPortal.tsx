import * as React from 'react';
import { createPortal } from 'react-dom';

export type ShadowPortalProps = {
  children: React.ReactNode;
};

export const ShadowPortal: React.FC<ShadowPortalProps> = function Portal({
  children
}) {
  let portalNode = React.useRef<HTMLElement | null>(null);
  let shadowNode = React.useRef<ShadowRoot | null>(null);
  let [, forceUpdate] = React.useState<{} | undefined>();

  React.useEffect(() => {
    portalNode.current = document.createElement('shuvi-portal');
    shadowNode.current = portalNode.current.attachShadow({ mode: 'open' });
    document.body.appendChild(portalNode.current);
    forceUpdate({});
    return () => {
      if (portalNode.current && portalNode.current.ownerDocument) {
        portalNode.current.ownerDocument.body.removeChild(portalNode.current);
      }
    };
  }, []);

  return shadowNode.current ? (
    createPortal(children, shadowNode.current as any)
  ) : (
    <span />
  );
};
