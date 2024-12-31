/**
 * @jest-environment node
 */

import { awaitPageLoadAndIdle } from '../../idleCallback';

describe('awaitPageLoadAndIdle', () => {
  it('should reject if called in a non-browser environment', async () => {
    await expect(awaitPageLoadAndIdle()).rejects.toThrow(
      '[awaitPageLoadAndIdle] server side is not supported'
    );
  });
});
