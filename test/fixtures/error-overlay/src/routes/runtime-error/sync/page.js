import React, { useEffect } from 'react';

export default function SyncRuntimeError() {
  useEffect(() => {
    // Trigger a synchronous runtime error
    throw new Error('Sync runtime error for testing error overlay');
  }, []);

  return (
    <div id="sync-error-page">
      <h1>Sync Runtime Error Test</h1>
      <p>This page will throw a synchronous error on mount.</p>
    </div>
  );
}
