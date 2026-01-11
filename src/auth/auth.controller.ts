import {
  Controller,
  Post,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  async login(@Request() req: any, @Body() body: any) {
    const user = req.user || body;
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @Post('register')
  async register(@Body() user: any) {
    return this.authService.register(user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 201, description: 'User successfully logged out.' })
  logout(@Request() req: any) {
    // In a statless JWT setup, logout is handled client-side by deleting the token.
    // This endpoint can be used for server-side blacklist or logging.
    return { message: 'Logout successful' };
  }
}
