import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  MessageNode,
  SmtpConfig,
  SmtpDriverContract,
  SmtpMailResponse,
} from '../mailer.interface';

@Injectable()
export class SMTPDriver implements SmtpDriverContract {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  private config: SmtpConfig;

  sendConfig(config: SmtpConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport(this.config);
  }

  async send(
    message: MessageNode,
    config?: SmtpConfig,
  ): Promise<SmtpMailResponse> {
    if (!this.transporter) {
      throw new Error(
        'Driver transport has been closed and cannot be used for sending emails',
      );
    }

    if (config) {
      this.sendConfig(config);
    }

    return this.transporter.sendMail(message);
  }

  async close() {
    this.transporter.close();
    this.transporter = null;
  }
}
