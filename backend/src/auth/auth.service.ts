import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const user = await this.usersService.create(email, password, name);
    return this.generateAuthResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
