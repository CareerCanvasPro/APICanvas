import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from '../../controllers/admin/AdminController';
import { RoleController } from '../../controllers/admin/RoleController';
import { AdminService } from '../../services/admin/admin.service';
import { RoleService } from '../../services/admin/role.service';
import { PermissionGuard } from '../../guards/permission.guard';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { Template } from '../../entities/template.entity';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Template]),
    MetricsModule
  ],
  controllers: [AdminController, RoleController],
  providers: [
    AdminService,
    RoleService,
    PermissionGuard
  ],
  exports: [AdminService, RoleService]
})
export class AdminModule {}