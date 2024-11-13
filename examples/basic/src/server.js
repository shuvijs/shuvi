export const handlePageRequest = originalHandlePageRequest => {
  return async (req, res) => {
    /**
     * Delay page request by 500ms to simulate a slow server
     * This is useful for testing race conditions.
     */
    await new Promise(resolve => setTimeout(resolve, 500));
    await originalHandlePageRequest(req, res);
  };
};
