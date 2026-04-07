// Wrapper for async route handlers to catch errors
// Usage: router.get('/path', asyncHandler(async (req, res) => {...}))

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    console.log(`📨 [asyncHandler] Handling request: ${req.method} ${req.path}`);
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        console.error(`❌ [asyncHandler] Caught error in ${req.method} ${req.path}:`, error.message);
        console.error('❌ [asyncHandler] Full error:', error);
        next(error);
      });
  };
};