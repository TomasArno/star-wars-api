import { BadRequestException } from '@nestjs/common';

export function parseId(id: string | number): number {
  if (typeof id === 'string' && isNaN(Number(id)))
    throw new BadRequestException('Invalid ID');

  return typeof id === 'string' ? parseInt(id) : id;
}
