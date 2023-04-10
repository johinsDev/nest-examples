import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // This is required for class-validator to work with NestJS injection
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(5019);
}

bootstrap();

// helmet
// compression
// fastify
// tenancy mongo
// deploy to google cloud run
//
// <body style="background: #f9f9f9;">
// <table width="100%" border="0" cellspacing="20" cellpadding="0"
//   style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
//   <tr>
//     <td align="center"
//       style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
//       Sign in to <strong>localhost:3000</strong>
//     </td>
//   </tr>
//   <tr>
//     <td align="center" style="padding: 20px 0;">
//       <table border="0" cellspacing="0" cellpadding="0">
//         <tr>
//           <td align="center" style="border-radius: 5px;" bgcolor="#346df1"><a href="http://localhost:3000/api/auth/callback/email?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsign-in&token=eb293ffc1e506496bffe2409332bd402725be757235b17558f9daeb3a558ccbe&email=johinsdev%40gmail.com"
//               target="_blank"
//               style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #346df1; display: inline-block; font-weight: bold;">Sign
//               in</a></td>
//         </tr>
//       </table>
//     </td>
//   </tr>
//   <tr>
//     <td align="center"
//       style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
//       If you did not request this email you can safely ignore it.
//     </td>
//   </tr>
// </table>
// </body>

// storage cloudinary/s3
// helath
// cache
// swagger
// @nestjs/schedule
// nest command
// ioredis
// rate limitting
// mailer forRootasync
// SMS manager
// app pushs manager
// web push manager
// roles and permissions,
// notifications
// auth socialite
// auth 2factor
// drizzle ORM
