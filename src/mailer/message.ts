import { Address, Attachment } from 'nodemailer/lib/mailer';
import { MessageContentViewsNode, MessageNode } from './mailer.interface';

export class Message {
  private nodeMailerMessage: MessageNode = {};

  /**
   * Path to the views used to generate content for the
   * message
   */
  private contentViews: {
    html?: {
      template: string;
      data?: any;
    };
  } = {};

  constructor(private deferred: boolean = false) {}

  /**
   * Returns address node with correctly formatted way
   */
  private getAddress(address: string, name?: string): Address | string {
    return name ? { address, name } : address;
  }

  /**
   * Add receipent as `to`
   */
  public to(address: string, name?: string): this {
    if (!Array.isArray(this.nodeMailerMessage.to)) {
      this.nodeMailerMessage.to = [];
    }

    this.nodeMailerMessage.to.push(this.getAddress(address, name));
    return this;
  }

  /**
   * Add `from` name and email
   */
  public from(address: string, name?: string): this {
    this.nodeMailerMessage.from = this.getAddress(address, name);
    return this;
  }

  /**
   * Define subject
   */
  public subject(message: string): this {
    this.nodeMailerMessage.subject = message;
    return this;
  }

  /**
   * Compute email html from raw text
   */
  public html(content: string): this {
    this.nodeMailerMessage.html = content;
    return this;
  }

  /**
   * Define one or attachments
   */
  public attach(filePath: string, options?: Attachment): this {
    this.nodeMailerMessage.attachments =
      this.nodeMailerMessage.attachments || [];
    this.nodeMailerMessage.attachments.push({
      path: filePath,
      ...options,
    });

    return this;
  }

  /**
   * Compute email html from defined view
   */
  public htmlView(template: string, data?: any): this {
    this.contentViews.html = { template, data };
    return this;
  }

  /**
   * Get message JSON. The packet can be sent over to nodemailer
   */
  public toJSON(): { message: MessageNode; views: MessageContentViewsNode } {
    return {
      message: this.nodeMailerMessage,
      views: this.contentViews,
    };
  }
}
