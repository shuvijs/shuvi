// This package 'trace' is a modified version of the Next.js that can be found here:
// https://github.com/vercel/next.js/tree/canary/packages/next/src/trace

import { trace, flushAllTraces, Span, SpanStatus } from './trace';
import { SpanId, setGlobal } from './shared';

export { trace, flushAllTraces, SpanId, Span, SpanStatus, setGlobal };
