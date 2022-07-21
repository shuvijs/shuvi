/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

// Extend the NodeJS namespace with Next.js-defined properties
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
