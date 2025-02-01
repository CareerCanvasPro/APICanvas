import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequirePermissions } from '../../decorators/require-permissions.decorator';
import { RoleService } from '../../services/admin/role.service';

@Controller('admin/roles')
@UseGuards(AdminGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions('roles', 'create')
  async createRole(@Body() roleData: any) {
    return this.roleService.createRole(roleData);
  }

  @Put(':id/permissions')
  @RequirePermissions('roles', 'update')
  async assignPermissions(
    @Param('id') roleId: string,
    @Body() data: { permissionIds: string[] }
  ) {
    return this.roleService.assignPermissions(roleId, data.permissionIds);
  }

  @Get(':id/permissions')
  @RequirePermissions('roles', 'read')
  async getRolePermissions(@Param('id') roleId: string) {
    return this.roleService.getRolePermissions(roleId);
  }

  @Delete(':id')
  @RequirePermissions('roles', 'delete')
  async deleteRole(@Param('id') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }
}