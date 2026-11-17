import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hashSync } from 'bcrypt';
import type { Model } from 'mongoose';
import { Admin } from '../admins/admin.schema.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  // Compared against when the email does not exist, so response time stays similar
  private readonly dummyHash = hashSync('dummy-password', 10);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto): Promise<{ token: string }> {
    const admin = await this.adminModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password');
    const passwordMatches = await compare(password, admin?.password ?? this.dummyHash);

    if (!admin || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({ sub: admin.id });
    return { token };
  }
}
