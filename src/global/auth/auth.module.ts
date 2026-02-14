import { Module } from '@nestjs/common';
import { UsersModule } from 'src/resources/users/users.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRETE,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRE_AFTER },
    }),
  ],
  providers: [],
})
export class AuthModule { }
