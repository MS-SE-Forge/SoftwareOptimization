import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VulnerableController } from './vulnerable.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController, VulnerableController],
  providers: [AppService],
})
export class AppModule {}
