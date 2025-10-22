import React from 'react';

// This component intentionally contains syntax errors for testing build error handling
export default function BuildErrorTest() {
  // Test 1: Create a component that will cause a build error during HMR
  const handleBuildError = () => {
    // Simulate a build error by trying to dynamically add invalid syntax
    const script = document.createElement('script');
    script.textContent = `
      // This will create a parse error when eval'd
      function invalidSyntax() {
        const x = [
        // Missing closing bracket intentionally
      }
    `;
    try {
      document.head.appendChild(script);
    } catch (e) {
      console.error('Build error simulation:', e);
    }
  };

  return (
    <div id="build-error-page">
      <h1>Build Error Test</h1>
      <p>This page tests build error overlay functionality.</p>
      <button onClick={handleBuildError} id="trigger-build-error">
        Trigger Build Error
      </button>
      <div id="build-status">Ready to test build errors</div>
    </div>
  );
}
