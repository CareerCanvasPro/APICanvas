import { Controller, Post, Body, UnauthorizedException, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AdminGuard } from '../admin.guard';

@Controller('admin/auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const isValid = await this.authService.validateAdmin(
      loginDto.username,
      loginDto.password
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authService.generateTokens(loginDto.username);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      username: loginDto.username
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    if (await this.tokenBlacklistService.isBlacklisted(refreshTokenDto.refreshToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const { accessToken } = await this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken
    );
    
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  @Post('logout')
  @UseGuards(AdminGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.tokenBlacklistService.blacklist(refreshTokenDto.refreshToken);
    return { message: 'Successfully logged out' };
  }
}