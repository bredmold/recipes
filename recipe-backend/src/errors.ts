export class RecipeError extends Error {
  override readonly name = 'RecipeError';

  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  override readonly name = 'BadRequestError';

  constructor(message: string) {
    super(message);
  }
}

export function statusCodeFor(e: Error): number {
  switch (e.name) {
    case 'BadRequestError':
      return 400;

    default:
      return 500;
  }
}
