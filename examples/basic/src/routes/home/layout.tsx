import React from 'react';
import { RouterView } from '@shuvi/runtime';

export default function Layout() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`[useEffect] layout useEffect`);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh'
      }}
    >
      /home/layout.tsx
      <RouterView />
    </div>
  );
}

export const loader = async () => {
  console.log('[demo] /home/layout loader');
  return {};
};
