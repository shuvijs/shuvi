import React from 'react';
import { RouterView } from '@shuvi/runtime';

export default function Layout() {
  return (
    <div
      style={{
        minHeight: '100vh'
      }}
    >
      /$/layout.tsx
      <RouterView />
    </div>
  );
}

export const loader = async () => {
  console.log('[demo] /$/layout loader');
  return {};
};
