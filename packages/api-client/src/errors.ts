/**
 * Application error hierarchy. Forwards `cause` to the native `Error`
 * constructor (ES2022) so devtools and error trackers (Sentry, Datadog)
 * automatically unwrap the chain.
 */
export class AppError extends Error {
  public readonly code: string;
  public override readonly cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export class ApiError extends AppError {
  public readonly status: number;

  constructor(status: number, code: string, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'ApiError';
    this.status = status;
  }
}
