const status = require("http-status");

/**
 * Generic error handler.  Output error details as JSON.
 *
 * WARNING: You shouldn't do this in a production environment in any circumstances
 *
 * @param {Error} error
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export default function errorMiddleware(error, req, res, next) {
  console.log(error);

  res.status(error.code || status.INTERNAL_SERVER_ERROR).json({
    status: "error",
    code: error.code || status.INTERNAL_SERVER_ERROR,
    message: error.message,
    trace: error.trace,
    details: error.details,
  });
}
