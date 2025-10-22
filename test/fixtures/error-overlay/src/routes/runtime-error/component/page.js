import React, { useState } from 'react';

function ErrorThrowingComponent() {
  throw new Error('Component error for testing error overlay');
}

export default function ComponentError() {
  const [showError, setShowError] = useState(false);

  const handleTriggerError = () => {
    setShowError(true);
  };

  if (showError) {
    return <ErrorThrowingComponent />;
  }

  return (
    <div id="component-error-page">
      <h1>Component Error Test</h1>
      <p>Click the button to trigger a component error.</p>
      <button id="trigger-error" onClick={handleTriggerError}>
        Trigger Component Error
      </button>
    </div>
  );
}
