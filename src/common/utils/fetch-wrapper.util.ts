import { HttpException, HttpStatus } from '@nestjs/common';

export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    let message =
      errorBody.error ||
      errorBody.message ||
      `Fetch failed with status ${response.status}`;
    let errors = errorBody.errors;

    // Adapt Go validation errors to the format expected by the GlobalExceptionFilter
    if (
      response.status === 400 &&
      errorBody.message === 'ValidationError' &&
      Array.isArray(errors)
    ) {
      const formattedErrors: Record<string, string[]> = {};
      const regex = /Field validation for '(.+)' failed on the '(.+)' tag/;

      errors.forEach((errStr: string) => {
        const match = errStr.match(regex);
        if (match) {
          const field = match[1];
          const tag = match[2];
          const camelField = field.charAt(0).toLowerCase() + field.slice(1);

          if (!formattedErrors[camelField]) {
            formattedErrors[camelField] = [];
          }
          formattedErrors[camelField].push(
            `Failed validation on the '${tag}' tag`,
          );
        } else {
          if (!formattedErrors['_global']) formattedErrors['_global'] = [];
          formattedErrors['_global'].push(errStr);
        }
      });
      errors = formattedErrors;
      message = 'Validation failed';
    }

    throw new HttpException(
      { message, errors },
      statusMap[response.status] || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return response.json() as Promise<T>;
}

const statusMap: Record<number, number> = {
  400: HttpStatus.BAD_REQUEST,
  401: HttpStatus.UNAUTHORIZED,
  403: HttpStatus.FORBIDDEN,
  404: HttpStatus.NOT_FOUND,
  409: HttpStatus.CONFLICT,
  422: HttpStatus.UNPROCESSABLE_ENTITY,
  500: HttpStatus.INTERNAL_SERVER_ERROR,
};
