import { BullModule } from '@nestjs/bull';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { SMTPDriver } from './drivers/smtp.driver';
import { MailerConsumer } from './mailer.consumer';
import { MailConfig, MailDriverContract } from './mailer.interface';
import { MailerService } from './mailer.service';

@Global()
@Module({
  providers: [MailerConsumer],
  exports: [],
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
})
export class MailerModule {
  private static getOptionToken(mailer: string, driver: string): string {
    return `CONFIG_${mailer.toUpperCase()}_${driver.toUpperCase()}`;
  }

  private static getDriverToken(mailer: string, driver: string): string {
    return `DRIVER_${mailer.toUpperCase()}_${driver.toUpperCase()}`;
  }

  static forRoot(options: MailConfig): DynamicModule {
    const providers: Provider[] = [];

    const drivers = new Map<string, MailDriverContract>();

    Object.keys(options.mailers).forEach((mailer) => {
      const driver = options.mailers[mailer].driver;
      const config = options.mailers[mailer].config;

      providers.push({
        provide: this.getOptionToken(mailer, driver),
        useValue: config,
      });

      providers.push({
        useFactory(moduleRef: ModuleRef) {
          switch (driver) {
            case 'smtp':
              const driver = moduleRef.get(SMTPDriver);
              driver.sendConfig(config);

              drivers.set(mailer, driver);

              return driver;
            default:
              throw new Error(`Driver ${driver} not supported`);
          }
        },
        provide: this.getDriverToken(mailer, driver),
        inject: [ModuleRef],
      });
    });

    providers.push({
      provide: 'MAILER_DRIVERS',
      useValue: drivers,
    });

    return {
      module: MailerModule,
      providers: [SMTPDriver, ...providers, MailerService],
      exports: [MailerService],
    };
  }
}
