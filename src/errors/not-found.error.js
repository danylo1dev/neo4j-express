const status = require("http-status");
export default class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = status.NotFoundError;
  }
}
