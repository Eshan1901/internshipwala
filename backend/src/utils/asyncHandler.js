/**
 * asyncHandler — Async Controller Wrapper
 *
 * Wraps an async Express route handler so that any rejected promise or
 * thrown error is automatically forwarded to next(err), reaching the
 * global error handler without a try/catch in every controller.
 *
 * Usage:
 *   router.get('/example', asyncHandler(async (req, res) => {
 *     const data = await someService.getData();
 *     sendSuccess(res, 200, 'OK', data);
 *   }));
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
