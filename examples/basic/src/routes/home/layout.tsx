import React from 'react';
import { RouterView, Link } from '@shuvi/runtime';

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
      {/* @ts-expect-error for test "to" is undefined */}
      <Link>go /symbol/calc</Link>
    </div>
  );
}

export const loader = async () => {
  console.log('[demo] /home/layout loader');
  return {};
};
