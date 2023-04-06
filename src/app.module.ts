import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost:27017/auth'),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
