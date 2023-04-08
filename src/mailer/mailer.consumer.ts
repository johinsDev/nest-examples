import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailerJobData } from './mailer.interface';
import { MailerService } from './mailer.service';

@Processor('mail')
export class MailerConsumer {
  private readonly logger = new Logger(MailerConsumer.name);

  constructor(private readonly mailer: MailerService) {}

  @Process('send')
  async send(job: Job<MailerJobData>, done) {
    try {
      this.logger.debug('Sending mail...');

      await this.mailer.sendCompiled(job.data.compiledMessage);

      this.logger.debug('Mail sent');

      return done();
    } catch (error) {
      this.logger.error(error);
      return done(error);
    }
  }
}
