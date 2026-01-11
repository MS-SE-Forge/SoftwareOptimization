import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Intentional Vulnerability: Command Injection (OWASP Top 10)
  @Get('unsafe')
  unsafe(@Query('cmd') cmd: string) {
    // VULNERABILITY: Executing user input directly
    exec(cmd, (_err, stdout) => {
      if (_err) {
        return;
      }
      console.log(stdout);
    });
    return 'Executed command';
  }

  // Intentional Vulnerability: Hardcoded Secret
  @Get('secret')
  getSecret() {
    const awsSecret = 'AKIAIMNOVALIDKEY12345'; // VULNERABILITY: Hardcoded secret
    return { secret: awsSecret };
  }
}
