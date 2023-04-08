import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { render } from '@react-email/render';
import Bull, { JobOptions, Queue } from 'bull';
import path from 'path';

import dayjs, { Dayjs } from 'dayjs';
import {
  CompiledMailNode,
  Mailable,
  MailDriverContract,
  MailerJobData,
  MessageComposeCallback,
  MessageContentViewsNode,
} from './mailer.interface';
import { Message } from './message';

// TODO: Add support for multiple drivers SES,mailgun,fake
// TODO: Add support for multiple queues
// TODO: Attachments, to, cc, bcc
// TODO: preview, getEtherealAccount

@Injectable()
export class MailerService {
  constructor(
    @Inject('MAILER_DRIVERS')
    private readonly drivers: Map<string, MailDriverContract>,
    @InjectQueue('mail') private mailerQueue: Queue,
    private eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {
    Mailable.mailer = this;
  }

  use(driver?: string) {
    if (!this.drivers.has(driver || 'default')) {
      throw new Error(`Driver ${driver} not found`);
    }

    return this.drivers.get(driver || 'default');
  }

  async compile(views: MessageContentViewsNode) {
    const emailPath = path.join(
      this.config.get('rootDir'),
      '../emails',
      views.html.template,
    );

    const email = (await import(emailPath)).default;

    const html = render(email(views.html.data || {}));

    return html;
  }

  private async prepareMessage(
    callback: MessageComposeCallback | Mailable,
  ): Promise<Message> {
    const message = new Message(false);

    if (callback instanceof Function) {
      await callback(message);
    }

    if (callback instanceof Mailable) {
      callback.build(message);
    }

    return message;
  }

  async send(callback: MessageComposeCallback | Mailable, config?: any) {
    const message = await this.prepareMessage(callback);

    const compiledMessage = message.toJSON();

    return this.sendCompiled({
      message: compiledMessage.message,
      views: compiledMessage.views,
      config,
    });
  }

  private async setEmailContent({ message, views }: CompiledMailNode) {
    if (views.html) {
      message.html = await this.compile(views);
    }
  }

  /**
   * Sends email using a pre-compiled message. You should use [[MailerContract.send]], unless
   * you are pre-compiling messages yourself
   */
  public async sendCompiled(mail: CompiledMailNode): Promise<any> {
    if (!mail.disableRender) {
      /**
       * Set content by rendering views
       */
      await this.setEmailContent(mail);
    }

    /**
     * Send email for real
     */
    const response = await this.use().send(mail.message, mail.config);

    /**
     * Emit event
     */
    this.eventEmitter.emit('mail:sent', {
      message: mail.message,
      views: Object.keys(mail.views).map((view) => mail.views[view].template),
      response,
    });

    return response;
  }

  async later(
    delay: Dayjs,
    callback: MessageComposeCallback | Mailable,
    config?: any,
    jobOptions?: JobOptions,
  ): Promise<Bull.Job<MailerJobData>> {
    const message = await this.prepareMessage(callback);

    const compiledMessage = message.toJSON();

    await this.setEmailContent(compiledMessage);

    return this.mailerQueue.add(
      'send',
      {
        compiledMessage: {
          message: compiledMessage.message,
          views: compiledMessage.views,
          config,
          disableRender: true,
        },
      },
      {
        removeOnComplete: true,
        delay: delay.diff(dayjs(), 'milliseconds'),
        ...jobOptions,
      },
    );
  }

  async queue(
    callback: MessageComposeCallback | Mailable,
    config?: any,
    jobOptions?: JobOptions,
  ): Promise<Bull.Job<MailerJobData>> {
    return this.later(dayjs(), callback, config, jobOptions);
  }

  async close() {
    return this.use().close();
  }
}
