import React, { useEffect } from 'react';

export default function AsyncRuntimeError() {
  useEffect(() => {
    // Trigger an asynchronous runtime error
    setTimeout(() => {
      throw new Error('Async runtime error for testing error overlay');
    }, 500);
  }, []);

  return (
    <div id="async-error-page">
      <h1>Async Runtime Error Test</h1>
      <p>This page will throw an async error after 500ms.</p>
    </div>
  );
}
