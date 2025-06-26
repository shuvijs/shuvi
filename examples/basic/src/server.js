export const handlePageRequest = originalHandlePageRequest => {
  return async (req, res) => {
    // Pretty print the request information with colors
    const colors = {
      GET: '\x1b[32m', // Green
      POST: '\x1b[34m', // Blue
      PUT: '\x1b[33m', // Yellow
      DELETE: '\x1b[31m', // Red
      PATCH: '\x1b[35m', // Magenta
      reset: '\x1b[0m', // Reset
      underline: '\x1b[4m' // Underline
    };

    const methodColor = colors[req.method] || colors.reset;
    const fullUrl = `${req.headers.host}${req.url}`;
    console.debug(
      `${methodColor}[${req.method}]${colors.reset} ${colors.underline}${fullUrl}${colors.reset}`
    );

    /**
     * Delay page request by 500ms to simulate a slow server
     * This is useful for testing race conditions.
     */
    await new Promise(resolve => setTimeout(resolve, 500));
    await originalHandlePageRequest(req, res);
  };
};
