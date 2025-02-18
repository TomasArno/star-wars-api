import { BadRequestException } from '@nestjs/common';

export function checkEmptyObject(body): boolean {
  if (!body || Object.keys(body).length === 0)
    throw new BadRequestException('Body cannot be empty');

  return false;
}
