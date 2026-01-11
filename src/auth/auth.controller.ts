import { Controller, Post, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  login(@Request() req: any, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = req.user || body;

    return this.authService.login(user as Omit<User, 'password'>);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @Post('register')
  register(@Body() user: any) {
    return this.authService.register(user as Prisma.UserCreateInput);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 201, description: 'User successfully logged out.' })
  logout() {
    // In a statless JWT setup, logout is handled client-side by deleting the token.
    // This endpoint can be used for server-side blacklist or logging.
    return { message: 'Logout successful' };
  }
}
