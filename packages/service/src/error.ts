class CustomError extends Error {
  constructor(message: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = this.constructor.name;
    this.message = message;
  }
}

class FatalError extends CustomError {}

const ErrorFactory = {
  From(message: string) {
    return new Error(message);
  },
  Fatal(message: string) {
    return new FatalError(message);
  }
};

export function isFatalError(error: Error): error is FatalError {
  return error instanceof FatalError;
}

export { ErrorFactory as Error };
