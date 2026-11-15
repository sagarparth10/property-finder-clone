import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

const SELF_FIELDS = ['name', 'phone', 'territory', 'avatar', 'preferences'] as const;
const ADMIN_FIELDS = [...SELF_FIELDS, 'role', 'active', 'email'] as const;

function pickFields(body: Record<string, unknown>, fields: readonly string[]) {
  const patch: Record<string, unknown> = {};
  for (const field of fields) {
    if (body[field] !== undefined) patch[field] = body[field];
  }
  return patch;
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    this.assertSelfOrAdmin(req.user, id);
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() updateDto: Record<string, unknown>, @Request() req) {
    this.assertSelfOrAdmin(req.user, id);
    const fields = req.user?.role === 'admin' ? ADMIN_FIELDS : SELF_FIELDS;
    return this.userService.update(id, pickFields(updateDto ?? {}, fields));
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  private assertSelfOrAdmin(actor: { role?: string; _id?: unknown }, id: string) {
    if (!actor) throw new ForbiddenException();
    if (actor.role === 'admin') return;
    if (String(actor._id) !== id) throw new ForbiddenException();
  }
}
