import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (resource: string, action: string) => 
  SetMetadata('permissions', [resource, action]);