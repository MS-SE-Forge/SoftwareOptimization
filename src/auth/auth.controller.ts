import { Controller, Post, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { LocalAuthGuard } from './local-auth.guard'; // Unused

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const user = req.user || body;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() user: any) {
    return this.authService.register(user);
  }
}
