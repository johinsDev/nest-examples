import { Logger } from '@nestjs/common';
import dayjs, { Dayjs } from 'dayjs';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailerService } from './mailer.service';
import { Message } from './message';

export type MessageNode = Mail.Options;

export interface MailDriverContract {
  send(message: MessageNode, config?: any): Promise<any>;
  close(): void | Promise<void>;
  sendConfig(config: any): void;
}

export type PostSentEnvolpeNode = { from: string; to: string[] };

/**
 * Shape of mail response for the smtp driver
 */
export type SmtpMailResponse = SMTPTransport.SentMessageInfo;

/**
 * Shape of the smtp driver
 */
export interface SmtpDriverContract extends MailDriverContract {
  send(message: MessageNode, config?: SmtpConfig): Promise<SmtpMailResponse>;
}

/**
 * Smtp driver config
 */
export type SmtpConfig = SMTPTransport.Options;

export interface MailDrivers {
  smtp: {
    config: SmtpConfig;
  };
}

/**
 * Expected shape of the config accepted by the "mailConfig"
 * method
 */
export type MailConfig = {
  mailers: {
    [name: string]: {
      [K in keyof MailDrivers]: { config: MailDrivers[K]['config'] } & {
        driver: K;
      };
    }[keyof MailDrivers];
  };
};

/**
 * Shape of the callback passed to the `send` method to compose the
 * message
 */
export type MessageComposeCallback = (message: Message) => void | Promise<void>;

export abstract class Mailable {
  private readonly logger = new Logger(Mailable.name);

  static mailer: MailerService;

  public mailer = (this.constructor as typeof Mailable).mailer;

  /**
   * Prepare mail message
   */
  public abstract build(message: Message): Promise<any> | any;

  send() {
    this.logger.debug('Send email');
    return this.mailer.send(async (message) => {
      this.logger.debug('Preparing mail message');
      await this.build(message);
    });
  }

  later(delay?: Dayjs) {
    return this.mailer.later(delay ?? dayjs(), async (message) => {
      await this.build(message);
    });
  }
}

/**
 * Shape of data view defined on the message
 */
export type MessageContentViewsNode = {
  html?: {
    template: string;
    data?: any;
  };
};

/**
 * Shape of the compiled mail.
 */
export type CompiledMailNode = {
  message: MessageNode;
  views: MessageContentViewsNode;
  config?: any;
  disableRender?: boolean;
};

export interface MailerJobData {
  compiledMessage: CompiledMailNode;
}
