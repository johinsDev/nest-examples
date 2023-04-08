import * as path from 'node:path';

export default () => {
  return {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    rootDir: process.env.ROOT_DIR || path.resolve(__dirname, '../'),
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 27017,
      database: process.env.DATABASE_NAME || 'auth',
      password: process.env.DATABASE_PASSWORD || '',
    },
    mail: {
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.MAIL_PORT || 2525,
      username: process.env.MAIL_USERNAME || 'username',
      password: process.env.MAIL_PASSWORD || 'password',
    },
    queue: {
      host: process.env.QUEUE_HOST || 'localhost',
      port: process.env.QUEUE_PORT || 6379,
    },
    auth: {
      email: {
        verify_host: process.env.VERIFY_HOST || 'http://localhost:3000',
      },
      JWT: {
        secret: process.env.JWT_SECRET || 'secret',
      },
    },
  };
};
