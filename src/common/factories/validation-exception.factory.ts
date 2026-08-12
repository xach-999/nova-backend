import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function formatValidationErrors(errors: ValidationError[]) {
  return errors.reduce<Record<string, string[]>>((formattedErrors, error) => {
    if (error.constraints) {
      formattedErrors[error.property] = Object.values(error.constraints);
    }

    return formattedErrors;
  }, {});
}

export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    success: false,
    statusCode: 400,
    error: 'VALIDATION_ERROR',
    message: 'Validation failed',
    errors: formatValidationErrors(errors),
  });
}
