import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MyLoggerModule } from 'src/global/logger/logger.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [MyLoggerModule],
  exports: [UsersService],
})
export class UsersModule {}
