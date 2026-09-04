import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { canAccessAgentPortal } from '../../common/rbac/rbac';
import { Agent } from '../agent/schemas/agent.schema';
import { User } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _pw, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(userData: RegisterDto) {
    const existing = await this.userModel.findOne({ email: userData.email });
    if (existing) throw new ConflictException('Email already registered');

    const role = userData.role === 'agent' || userData.role === 'broker' ? userData.role : 'user';
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userModel.create({
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      phone: userData.phone,
      territory: userData.territory || 'Dubai',
      role,
    });

    if (role === 'agent' || role === 'broker') {
      await this.agentModel.create({
        userId: String(user._id),
        specialization: 'Residential',
        languages: ['English'],
        active: true,
      });
    }

    const { password: _pw, ...result } = user.toObject();
    const token = this.jwtService.sign({ email: user.email, sub: user._id, role: user.role });
    return { user: result, access_token: token, token };
  }

  toPublicUser(user: any) {
    const raw = user.toObject ? user.toObject() : user;
    const { password, ...safe } = raw;
    return {
      ...safe,
      id: String(raw._id || raw.id),
      canAccessAgentPortal: canAccessAgentPortal(raw.role),
    };
  }
}

