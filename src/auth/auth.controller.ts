import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { AuthService } from './auth.service';

interface RequestWithUser extends Request {
  user?: any;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user as Omit<User, 'password'>);
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
    // In a stateless JWT setup, logout is handled client-side by deleting the token.
    // This endpoint can be used for server-side blacklist or logging.
    return { message: 'Logout successful' };
  }
}
