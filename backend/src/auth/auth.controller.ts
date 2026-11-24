import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js';
import { LoginRateLimitGuard } from './login-rate-limit.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LoginRateLimitGuard)
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  @ApiOperation({ summary: 'Admin login. Returns a JWT to use in the Authorization header.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiOperation({ summary: 'Return the authenticated admin profile' })
  me(@Req() request: AuthenticatedRequest) {
    if (!request.admin) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return this.authService.getProfile(request.admin.id);
  }
}
