import React, { useEffect } from 'react';

export default function PromiseRejectionError() {
  useEffect(() => {
    // Trigger a promise rejection error
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(
          new Error('Unhandled promise rejection for testing error overlay')
        );
      }, 300);
    });

    // Don't catch the rejection to trigger unhandledrejection event
    p.then(() => {});
  }, []);

  return (
    <div id="promise-error-page">
      <h1>Promise Rejection Error Test</h1>
      <p>This page will trigger an unhandled promise rejection.</p>
    </div>
  );
}
