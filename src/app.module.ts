import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VulnerableController } from './vulnerable.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, VulnerableController],
  providers: [AppService],
})
export class AppModule {}
