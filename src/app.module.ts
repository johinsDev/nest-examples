import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import mainConfig from './config/main.config';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [mainConfig] }),
    BullModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          redis: {
            host: config.get('queue.host'),
            port: config.get('queue.port'),
          },
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    MailerModule.forRoot({
      mailers: {
        default: {
          driver: 'smtp',
          config: {
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
              user: '5f9a58cee8546f',
              pass: 'ce3f98bfc8d131',
            },
          },
        },
      },
    }),
    MongooseModule.forRootAsync({
      useFactory(config: ConfigService) {
        function getURI() {
          const { user, password, database, host, port } =
            config.get('database');

          const auth = user && password ? `${user}:${password}@` : '';

          return `mongodb://${auth}${host}:${port}/${database}`;
        }

        return {
          uri: getURI(),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
