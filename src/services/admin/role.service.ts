import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

  async createRole(roleData: Partial<Role>) {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({ 
      where: { id: roleId },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.findByIds(permissionIds);
    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async getRolePermissions(roleId: string) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role.permissions;
  }

  async checkPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions']
    });

    if (!role) {
      return false;
    }

    return role.permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  }
}