import { Mailable } from 'src/mailer/mailer.interface';
import { Message } from 'src/mailer/message';

export class MagicLinkEmail extends Mailable {
  constructor(
    private readonly data: {
      name: string;
      email: string;
      url: string;
      token: string;
    },
  ) {
    super();
  }

  build(message: Message): void {
    message
      .to(this.data.email)
      .subject('Magic Link')
      .htmlView('magic-link', this.data);
    // .content(Email());
  }
}
