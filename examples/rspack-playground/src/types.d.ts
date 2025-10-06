declare global {
  interface Window {
    React: typeof import('react');
    ReactDOM: typeof import('react-dom/client');
  }
}

export {};
